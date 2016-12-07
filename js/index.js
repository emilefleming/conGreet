(function() {
  'use strict';
  $('select').material_select();

  const $repFilters = $('#repFilters');
  const $repContainer = $('#repContainer');
  const $loadIn = $('<div>').addClass('determinate red');
  const $loadBar = $('<div>').addClass('progress white').append($loadIn);
  const $loader = $('<div>').addClass('loader').append($loadBar);
  const myInfo = {};
  const repData = {};
  const recentPages = [];

  const openPage = function(page) {
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
    const $recentVotes = $('<div>').addClass('recentVotes');
    $profileData.append($recentVotes);
    const $vidBox = $('<div>').addClass('vidBox');
    $profileData.append($vidBox);

    const getRecentVotes = function(id) {
      const $xhr = $.ajax({
        method: 'GET',
        url: `https://www.govtrack.us/api/v2/vote_voter?person=${id}&sort=-created&limit=5`
      });

      $xhr.done((data) => {
        $recentVotes.append($('<h5>').text('Recent Votes'));
        for (const bill of data.objects) {
          const $voteBox = $('<div>').addClass('vote');
          const $voteInfo = $('<div>').text(bill.vote.question);
          if (bill.option.value === 'Yea' || bill.option.value === 'Aye') {
            $voteBox.append($('<div>').addClass('yesVote'));
          } else if (bill.option.value === 'Nay' || bill.option.value === 'No') {
            $voteBox.append($('<div>').addClass('noVote'));
          } else {
            $voteBox.append($('<div>').addClass('nullVote'));
          }
          $voteInfo.append($('<div>').text(bill.vote.result));
          $voteBox.append($voteInfo);
          $recentVotes.append($voteBox);
        };
      });
    }
    getRecentVotes(repData[member].govTrackId);

    const recentVideos = function (username) {
      const $xhr = $.ajax({
        method: 'GET',
        url: `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=${username}&key=AIzaSyDC5Xq8x4BqCFQRBw6uKF6PFw_5FSfwFFk`
      });

      $xhr.done((data) => {
        if ($xhr.status !== 200) {
          return;
        }
        getRecentVideos(data.items[0].contentDetails.relatedPlaylists.uploads);
      });
    }

    const getRecentVideos = function (id) {
      const $xhr = $.ajax ({
        method: 'GET',
        url: `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=${id}&key=AIzaSyDC5Xq8x4BqCFQRBw6uKF6PFw_5FSfwFFk`
      });

      $xhr.done((data) => {
        $vidBox.append($('<h5>').text('Recent Videos'));
        for (const video of data.items) {
          const $frame = $('<iframe>').attr('width', '100%').attr('height', '56vw');
          const $vidWrap = $('<div>').addClass('videoWrapper');
          const $vidTitle = $('<h6>').text(video.snippet.title);
          $frame.attr('src', 'https://www.youtube-nocookie.com/embed/' + video.contentDetails.videoId + '?showinfo=0');
          $frame.attr('allowfullscreen', '').attr('frameborder', '0');
          $frame.appendTo($vidWrap);
          $vidWrap.appendTo($vidBox);
          $vidTitle.appendTo($vidBox);
        }
      });
    }

    $bioPage.append($profileData);
    $bioPage.appendTo($('main'));
    openPage($bioPage);
    if (repData[member].youtube) {
      recentVideos(repData[member].youtube)
    }
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
    thisRep.govTrackId = member.person.id;
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
    $('.button-collapse').sideNav('hide');
    switch (event.target.id) {
      case 'zipLink':
        openPage($('#enterZip'));
        break;
      case 'myReps':
        if (!myInfo.state || !myInfo.district) {
          Materialize.toast('Please enter your address', 4000);
          break;
        }
        empty();
        openPage($repContainer);
        ajax(`&role_type=senator&state=${myInfo.state}`);
        ajax(`&role_type=representative&state=${myInfo.state}&district=${myInfo.district}`);
        break;
      case 'allReps':
        openPage($('#searchBox'));
        break;
      case 'bills' :
      
        break;
      default:
        break;
    }
  });

  $('#back').on('click', goBack);

  $repFilters.on('submit', (event) => {
    event.preventDefault();
    let partyFilter = '';
    let chamberFilter = '';
    let stateFilter = '';
    const parties = $('select[name=filterParty]').val();
    const chambers = $('select[name=filterChamber]').val();
    if (!parties.length) {
      Materialize.toast('At least one party must be selected', 4000);
    }
    if (!chambers.length) {
      Materialize.toast('At least one party must be selected', 4000);
    }
    if (parties.length < 3) {
      partyFilter = '&party=' + parties.join('&party=');
    }
    if (chambers.length < 2) {
      chamberFilter = '&role_type=' + chambers[0];
    }
    if ($('#stateSwitch:checked').length) {
      const states = $('#stateCheckWrapper input:checked');
      for (const state of states) {
        stateFilter += '&state=' + state.id;
      }
    }
    const filters = partyFilter + chamberFilter + stateFilter;
    openPage($repContainer);
    empty();
    ajax(filters);
  });

  $('#stateSwitch').on('change', () => {
    $('#stateCheckWrapper').toggleClass('hidden');
  });

  $('#optionBox').on('click', 'button', (event) =>{
    const state = event.target.name.slice(0, 2);
    const district = event.target.name.slice(2, event.target.name.length);
    myInfo.state = state;
    myInfo.district = district;
    empty();
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
        $('nav').removeClass('hidden');
        openPage($optionBox);
      }
    });
  });
  $(".button-collapse").sideNav();
})();
