(function() {
  'use strict';

  const $repContainer = $('#repContainer');
  const $loadIn = $('<div>').addClass('determinate grey');
  const $loadBar = $('<div>').addClass('progress white').append($loadIn);
  const $loader = $('<div>').addClass('loader').append($loadBar);
  const myInfo = {};
  const repData = {};
  const recentPages = [];

  const openPage = function(page) {
    console.log(page);
    $('.page').addClass('hidden');
    page.removeClass('hidden');
    recentPages.push(page);
  }

  const goBack = function() {
    if (recentPages.length < 2) {
      openPage($('#enterZip'));
      return;
    }
    recentPages.pop();
    openPage(recentPages.pop());
  }

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

  const renderBio = function(member) {
    const $bioPage = $('<div>').addClass('page profile').attr('id', member);
    const $namePic = $('<div>').addClass('namePic');
    const $profileData = $('<div>').addClass('profileData');
    const $title = $('<div>').addClass('title');
    const $contactStats = $('<div>').addClass('contactStats');
    const $socialStats = $('<div>');
    $bioPage.addClass(repData[member].party);
    $('<img>').attr('src', 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + member + '.jpg').addClass('profilePic').appendTo($namePic);
    const $name = $('<h3>').text(repData[member].name);
    const $party = $('<h3>');
    $party.text(' ' + repData[member].party).addClass('prt');
    const $repTitle = $('<h4>').text(repData[member].description);
    $namePic.append($name);
    $bioPage.append($namePic);
    $title.append($party);
    $title.append($repTitle);
    $profileData.append($title);

    if (repData[member].address) {
      const address = repData[member].address;
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
      $addrBox.append($('<div>').text(repData[member].name));
      $addrBox.append($('<div>').text(addrTop));
      $addrBox.append($('<div>').text(addrBot));
      $address.append($addrBox)
      $address.appendTo($contactStats);
    }

    if (repData[member].phone) {
      const $phone = $('<div>').addClass('stat');
      $phone.append($('<i>').addClass('mdi mdi-phone'));
      $phone.append($('<a>').attr('href', 'tel:' + repData[member].phone).text(repData[member].phone));
      $phone.appendTo($contactStats);
    }

    if (repData[member].contact) {
      const $contact = $('<div>').addClass('stat');
      $contact.append($('<i>').addClass('mdi mdi-email'));
      $contact.append($('<a>').attr('href', repData[member].contact).attr('target', '_blank').text('Email'));
      $contact.appendTo($contactStats);
    }

    if (repData[member].website) {
      const $website = $('<div>').addClass('stat');
      $website.append($('<i>').addClass('mdi mdi-earth'));
      $website.append($('<a>').attr('href', repData[member].website).attr('target', '_blank').text(repData[member].website));
      $website.appendTo($socialStats);
    }

    if (repData[member].twitter) {
      const $twitter = $('<div>').addClass('stat');
      $twitter.append($('<i>').addClass('mdi mdi-twitter'));
      $twitter.append($('<a>').attr('href', 'https://twitter.com/' + repData[member].twitter).attr('target', '_blank').text(repData[member].twitter));
      $twitter.appendTo($socialStats);
    }

    if (repData[member].youtube) {
      const $youtube = $('<div>').addClass('stat');
      $youtube.append($('<i>').addClass('mdi mdi-youtube-play'));
      $youtube.append($('<a>').attr('href', 'https://youtube.com/user/' + repData[member].youtube).attr('target', '_blank').text(repData[member].youtube));
      $youtube.appendTo($socialStats);
    }

    $profileData.append($contactStats);
    $profileData.append($socialStats);
    $bioPage.append($profileData);
    $bioPage.appendTo($('main'));
    openPage($bioPage);
  }

  const renderMem = function(legislature, percTotal, i) {
    if (i === legislature.length) {
      $loader.remove();
      $loadIn.width('0');
      $('#repContainer').removeClass('loading');
      return;
    }
    const member = legislature[i];
    repData[member.person.bioguideid] = {};
    const thisRep = repData[member.person.bioguideid];
    thisRep.id = member.person.bioguideid;
    thisRep.name = member.person.firstname + ' ' + member.person.lastname;
    thisRep.party = member.party.toLowerCase();
    thisRep.description = member.description;
    thisRep.address = member.extra.address;
    thisRep.phone = member.phone;
    thisRep.contact = member.extra.contact_form;
    thisRep.website = member.website;
    thisRep.twitter = member.person.twitterid;
    thisRep.youtube = member.person.youtubeid;

    const percEach = 1 / legislature.length;
    const $card = $('<div>').addClass('card hoverable').addClass(thisRep.party);
    const $shortInfo = $('<div>').addClass('shortInfo');
    const $repInfo = $('<div>').addClass('repInfo');
    const $nameTag = $('<h4>').text(thisRep.name);
    const $actionBox = $('<div>').addClass('row');
    const $callButton = $('<a>').addClass('col s6 btn action').attr('href', 'tel:' + thisRep.phone);
    $callButton.append($('<i>').addClass('mdi mdi-phone'));
    $callButton.append($('<span>').text(thisRep.phone));
    const $bioButton = $('<a>').addClass('col s6 btn action bioBut');
    $bioButton.attr('name', thisRep.id);
    $bioButton.append($('<i>').addClass('mdi mdi-account'));
    $bioButton.append($('<span>').text('Profile'));
    $actionBox.append($bioButton);
    $actionBox.append($callButton);

    $('<img>').attr('src', 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + thisRep.id + '.jpg').addClass('headshot').appendTo($shortInfo);
    $('<span>').addClass('party').addClass(thisRep.party).text(' ' + thisRep.party).appendTo($nameTag);
    $repInfo.append($nameTag);
    $('<h5>').text(`${thisRep.description}`).appendTo($repInfo);

    $shortInfo.append($repInfo);
    $card.append($shortInfo);
    $card.append($actionBox);
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

  $('#back').on('click', goBack);

  $('#optionBox').on('click', 'button', (event) =>{
    const state = event.target.name.slice(0, 2);
    const district = event.target.name.slice(2, event.target.name.length);
    myInfo.state = state;
    myInfo.district = district;
    empty();
    $('#optionBox').empty();
    openPage($repContainer);
    ajax(`&role_type=senator&state=${state}`);
    ajax(`&role_type=representative&state=${state}&district=${district}`);
  });

  $repContainer.on('click', '.bioBut', (event) => {
    let id;
    if (!event.target.name) {
      id = event.target.parentNode.name;
    } else {
      id = event.target.name;
    }
    renderBio(id);
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
        $option.append($('<span>').text(result.formatted_address));
        $option.append($button);
        $optionBox.append($option);
        $('.welcome').remove();
        $('nav').removeClass('hidden');
      }
    });
  });
  $(".button-collapse").sideNav();
})();
