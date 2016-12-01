(function() {
  'use strict';

  const $repContainer = $('#repContainer');
  const $loadIn = $('<div>').addClass('determinate grey');
  const $loadBar = $('<div>').addClass('progress white').append($loadIn);
  const $loader = $('<div>').addClass('loader').append($loadBar);
  const myInfo = {};

  const empty = function() {
    $repContainer.empty();
    $repContainer.append($loader);
  }

  const ajax = function(options) {
    let theOptions = '';
    if (options) {
      theOptions = options;
    }
    const $xhr = $.ajax({
      method: 'GET',
      url: "https://www.govtrack.us/api/v2/role?current=true&limit=999&sort=person" + theOptions
    });

    $xhr.done((data) =>{
      if ($xhr.status !== 200) {
        return;
      }
      renderMem(data.objects, 0, 0);
      $('#repContainer').addClass('loading');
    });
  }

  const renderMem = function(legislature, percTotal, i) {
    if (i === legislature.length) {
      $loader.remove();
      $loadIn.width('0');
      $('#repContainer').removeClass('loading');
      return;
    }
    const member = legislature[i];
    const percEach = 1 / legislature.length;
    const rep = member.person;
    const party = member.party.toLowerCase();
    const $card = $('<div>').addClass('card hoverable').addClass(party);
    const $shortInfo = $('<div>').addClass('shortInfo');
    const $repInfo = $('<div>').addClass('repInfo');
    const $statBox = $('<div>').addClass('row statBox');
    const $contactStats = $('<div>').addClass('col s12 m6 l4');
    const $socialStats = $('<div>').addClass('col s12 m6 l4');
    const $nameTag = $('<h4>').text(`${rep.firstname} ${rep.lastname}`);

    $('<img>').attr('src', 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + rep.bioguideid + '.jpg').addClass('headshot').appendTo($shortInfo);
    $('<span>').addClass('party').addClass(party).text(' ' + party).appendTo($nameTag);
    $repInfo.append($nameTag);
    $('<h5>').text(`${member.description}`).appendTo($repInfo);

    if (member.extra.address) {
      const address = member.extra.address;
      let addrTop = '';
      let addrBot = '';
      const semiLoc = address.indexOf(';');
      const washLoc = address.indexOf('Washington');
      const $address = $('<div>').addClass('stat');
      const $addrBox = $('<div>');
      if (semiLoc > -1) {
        addrTop = address.slice(0, semiLoc);
        addrBot = address.slice(semiLoc + 1, address.length)
      } else {
        addrTop = address.slice(0, washLoc);
        addrBot = address.slice(washLoc, address.length)
      }
      $address.append($('<i>').addClass('mdi mdi-domain'));
      $addrBox.append($('<div>').text(`${rep.firstname} ${rep.lastname}`));
      $addrBox.append($('<div>').text(addrTop));
      $addrBox.append($('<div>').text(addrBot));
      $address.append($addrBox)
      $address.appendTo($contactStats);
    }

    if (member.phone) {
      const $phone = $('<div>').addClass('stat');
      $phone.append($('<i>').addClass('mdi mdi-phone'));
      $phone.append($('<a>').attr('href', 'tel:' + member.phone).text(member.phone));
      $phone.appendTo($contactStats);
    }

    if (member.extra.contact_form) {
      const $contact = $('<div>').addClass('stat');
      $contact.append($('<i>').addClass('mdi mdi-email'));
      $contact.append($('<a>').attr('href', member.extra.contact_form).attr('target', '_blank').text('Email'));
      $contact.appendTo($contactStats);
    }

    if (member.website) {
      const $website = $('<div>').addClass('stat');
      $website.append($('<i>').addClass('mdi mdi-earth'));
      $website.append($('<a>').attr('href', member.website).attr('target', '_blank').text(member.website));
      $website.appendTo($socialStats);
    }

    if (rep.twitterid) {
      const $twitter = $('<div>').addClass('stat');
      $twitter.append($('<i>').addClass('mdi mdi-twitter'));
      $twitter.append($('<a>').attr('href', 'https://twitter.com/' + rep.twitterid).attr('target', '_blank').text(rep.twitterid));
      $twitter.appendTo($socialStats);
    }

    if (rep.youtubeid) {
      const $youtube = $('<div>').addClass('stat');
      $youtube.append($('<i>').addClass('mdi mdi-youtube-play'));
      $youtube.append($('<a>').attr('href', 'https://youtube.com/user/' + rep.youtubeid).attr('target', '_blank').text(rep.youtubeid));
      $youtube.appendTo($socialStats);
    }

    $statBox.append($contactStats);
    $statBox.append($socialStats);
    $shortInfo.append($repInfo);
    $card.append($shortInfo);
    $card.append($statBox);
    $repContainer.append($card);

    percTotal += percEach * 100;
    const width = Math.round(percTotal) + '%';
    $loadIn.width(width);
    i++;
    window.setTimeout(()=> {
      renderMem(legislature, percTotal, i++)
    }, 1);
  }

  $('nav ul').on('click', 'a', (event) => {
    switch (event.target.id) {
      case 'allLeg':
        empty();
        ajax();
        break;
      case 'senators':
        empty();
        ajax('&role_type=senator');
        break;
      case 'reps':
        empty();
        ajax('&role_type=representative');
        break;
      default:
        break;
    }
  });

  $('#optionBox').on('click', 'button', (event) =>{
    const state = event.target.name.slice(0, 2);
    const district = event.target.name.slice(2, event.target.name.length);
    myInfo.state = state;
    myInfo.district = district;
    empty();
    $('#optionBox').empty();
    window.location.href = '#repContainer';
    const $backBt = $('<a>').addClass('btn red back').attr('href', '#enterZip');
    $backBt.text('BACK');
    $repContainer.append($backBt);
    ajax(`&role_type=senator&state=${state}`);
    ajax(`&role_type=representative&state=${state}&district=${district}`);
  });

  $repContainer.on('click', '.card', (event) => {
    let card;
    if ($(event.target).hasClass('shortInfo')) {
      card = event.target;
    } else {
      card = $(event.target).parents('.shortInfo').last().get(0);
    }
    $(card).parent().toggleClass('open');
  });

  $('#enterZip form').on('submit', (event) => {
    event.preventDefault();
    const input = $('#enterZip input').val();
    if (!input.trim()) {
      Materialize.toast('Please enter an address', 4000);
      return;
    }
    const $xhr = $.ajax({
      method: 'GET',
      url: 'https://api.geocod.io/v1/geocode?q=' + input + '&api_key=15850078f71371512517105178513041fff87f3&fields=cd'
    });

    $xhr.done((data) => {
      if ($xhr.status !== 200) {
        return;
      }
      const $optionBox = $('#optionBox');
      $optionBox.empty();
      for (const result of data.results) {
        const $option = $('<div>').addClass('addrOption card');
        const $button = $('<button>').addClass('btn blue').text('GO');
        const state = result.address_components.state;
        const dist = result.fields.congressional_district.district_number;
        $button.attr('name', state + dist);
        $option.append($button);
        $option.append($('<span>').text(result.formatted_address));
        $optionBox.append($option);
        $('.welcome').remove();
      }
    });
  });
  console.log($(".button-collapse"));
  $(".button-collapse").sideNav();
})();
