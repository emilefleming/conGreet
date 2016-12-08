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

// NAV FUNCTIONS

  const empty = function() {
    $repContainer.empty();
    $repContainer.append($loader);
  }

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

// AJAX FUNCTIONS

  const ajax = function(callBack, path, queryIn, extra) {
    let queries = '';
    if (queryIn) {
      queries = queryIn;
    }
    const $xhr = $.ajax({
      method: 'GET',
      url: path + queries
    });

    $xhr.done((data) =>{
      if ($xhr.status !== 200) {
        return;
      }
      callBack(data, extra);
      // renderMem(data.objects);
      // $('#repContainer').addClass('loading');
    });
  }

// CACHE FUNCTIONS

  const cacheMemberCard = function(thisRep) {
    const picUrl = 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + thisRep.id + '.jpg'
    const $card = $('<div>');
    const $shortInfo = $('<div>').addClass('shortInfo');
    const $repInfo = $('<div>').addClass('repInfo');
    const $nameTag = $('<h4>').text(thisRep.name);
    const $actionBox = $('<div>').addClass('row');
    const $callButton = $('<a>').addClass('col s6 btn action');
    const $bioButton = $('<a>').addClass('col s6 btn action bioBut');

    $callButton.attr('href', 'tel:' + thisRep.phone);
    $callButton.append($('<i>').addClass('mdi mdi-phone'));
    $callButton.append($('<span>').text(thisRep.phone));
    $bioButton.attr('name', thisRep.id);
    $bioButton.append($('<i>').addClass('mdi mdi-account'));
    $bioButton.append($('<span>').text('Profile'));
    $actionBox.append($bioButton);
    $actionBox.append($callButton);
    $card.addClass('card hoverable').addClass(thisRep.party);

    $('<img>').attr('src', picUrl).addClass('headshot').appendTo($shortInfo);
    $('<span>').addClass('party').addClass(thisRep.party).text(' ' + thisRep.party).appendTo($nameTag);
    $repInfo.append($nameTag);
    $('<h5>').text(`${thisRep.description}`).appendTo($repInfo);

    $shortInfo.append($repInfo);
    $card.append($shortInfo);
    $card.append($actionBox);
    thisRep.card = $card;
  }

  const cacheMember = function(member) {
    if (repData[member.person.bioguideid]) {
      return;
    }
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
    cacheMemberCard(thisRep);
  }

  const preCacheMember = function (data) {
    cacheMember(data.objects[0]);
  };

// RENDER FUNCTIONS

  const renderAddresses = function(response) {
    const $optionBox = $('#optionBox');
    $optionBox.empty();
    for (const result of response.results) {
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
  }

  const renderContactInfo = function (member) {
    const $contactBox = $('<div>').addClass('row contactBox');
    const $contactStats = $('<div>').addClass('contactStats col s12 m5 offset-m1');
    const $socialStats = $('<div>').addClass('col s12 m5');

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

    const buildLink = function(obj) {
      if (!obj.text || !obj.url) {
        return;
      }

      const $stat = $('<div>').addClass('stat');
      const $link = $('<a>').attr('target', obj.target);

      $stat.append($('<i>').addClass('mdi mdi-' + obj.icon));
      $stat.append($link.attr('href', obj.url).text(obj.text));
      return $stat;
    }

    const phone = {
      text: repData[member].phone,
      url: 'tel:' + repData[member].phone,
      icon: 'phone',
      target: ''
    }

    const contact = {
      text: 'Contact Form',
      url: repData[member].contact,
      icon: 'email',
      target: '_blank'
    }

    const website = {
      text: repData[member].website,
      url: repData[member].website,
      icon: 'earth',
      target: '_blank'
    }

    const twitter = {
      text: repData[member].twitter,
      url: 'https://twitter.com/' + repData[member].twitter,
      icon: 'twitter',
      target: '_blank'
    }

    const youtube = {
      text: repData[member].youtube,
      url: 'https://youtube.com/user/' + repData[member].youtube,
      icon: 'youtube-play',
      target: '_blank'
    }

    $contactStats.append(buildLink(phone));
    $contactStats.append(buildLink(contact));
    $socialStats.append(buildLink(website));
    $socialStats.append(buildLink(twitter));
    $socialStats.append(buildLink(youtube));

    $contactBox.append($('<h5>').text('Contact'));
    $contactBox.append($contactStats);
    $contactBox.append($socialStats);

    return $contactBox;
  }

  const renderRecentVotes = function(data, member) {
    $('#' + member + ' .recentVotes').append($('<h5>').text('Recent Votes'));
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
      $('#' + member + ' .recentVotes').append($voteBox);
    };
  };

  const recentVideos = function (member) {
    const username = repData[member].youtube;
    const path = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&key=AIzaSyDC5Xq8x4BqCFQRBw6uKF6PFw_5FSfwFFk`;
    const queries = '&forUsername=' + username;

    ajax(getRecentVideos, path, queries, member);
  };

  const getRecentVideos = function (data, member) {
    const id = data.items[0].contentDetails.relatedPlaylists.uploads;
    const path = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&key=AIzaSyDC5Xq8x4BqCFQRBw6uKF6PFw_5FSfwFFk`;
    const queries = '&playlistId=' + id;

    ajax(renderRecentVideos, path, queries, member);
  };

  const renderRecentVideos = function (data, member) {
    const $vidBox = $('#' + member + ' .vidBox');

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
  };

  const renderBio = function(member) {
    const memberPage = '#' + member;

    if ($(memberPage).length) {
      openPage($(memberPage));
      return;
    }

    const $bioPage = $('<div>').addClass('page profile').attr('id', member);
    const $namePic = $('<div>').addClass('namePic');
    const $profileData = $('<div>').addClass('profileData');
    const $title = $('<div>').addClass('title');

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

    const $contactBox = renderContactInfo(member);
    const $recentVotes = $('<div>').addClass('recentVotes');
    const $vidBox = $('<div>').addClass('vidBox');

    $profileData.append($contactBox);
    $profileData.append($recentVotes);
    $profileData.append($vidBox);

    const path = 'https://www.govtrack.us/api/v2/vote_voter?';
    const queries = `person=${repData[member].govTrackId}&sort=-created&limit=5`;

    ajax(renderRecentVotes, path, queries, member);
    if (repData[member].youtube) {
      recentVideos(member)
    }

    $bioPage.append($profileData);
    $bioPage.appendTo($('main'));
    openPage($bioPage);
  }

  const renderMem = function(data, percTotal = 0, i = 0) {
    if (i === data.objects.length) {
      $loader.remove();
      $loadIn.width('0');
      $('#repContainer').removeClass('loading');
      return;
    }

    const legislature = data.objects;
    const member = legislature[i];
    cacheMember(member);
    const thisRep = repData[member.person.bioguideid];
    const percEach = 1 / legislature.length;

    $repContainer.append(thisRep.card.clone());
    percTotal += percEach * 100;
    const width = Math.round(percTotal) + '%';
    $loadIn.width(width);
    i++;
    window.setTimeout(()=> {
      renderMem(data, percTotal, i++)
    }, 1);
  }

  const renderVotes = function (data, target) {
    for (const vote of data.objects) {
      $('#' + target).append(renderVote(vote));
    };
  }

  const renderVote = function(vote) {
    const $card = $('<div>').addClass('card voteCard');
    const $titleBlock = $('<div>').addClass('titleBlock');
    const $title = $('<div>').text(vote.related_bill.display_number);
    const $result = $('<div>');
    const $description = $('<p>').text(vote.question);

    $card.attr('name', vote.related_bill.id);
    $result.text(vote.result + ' ' + vote.chamber_label);

    $titleBlock.append($title);
    $titleBlock.append($result);

    $card.append($titleBlock);
    $card.append($description);
    return $card;
  }

  const renderSmallCard = function(bioguideid, name, id) {
    const $card = $('<div>').addClass('smallCard col s12 m6 l4');
    const $img = $('<img>').attr('src', 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + bioguideid + '.jpg');

    $card.append($img);
    $card.append($('<h4>').text(name));

    $card.on('click', () => {
      renderBio(bioguideid);
    });

    return $card
  }

  const renderBillVotes = function (data, id) {
    const $voteBox = $('<div>').addClass('votesForBill');
    $voteBox.append($('<h5>').text('Votes'));
    for (const vote of data.objects) {
      console.log(vote);
      $voteBox.append(renderVote(vote));
    }
    $('#' + id + ' .billData').append($voteBox);
  }

  const renderBill = function(data, id) {
    if ($('#' + id).length) {
      openPage($('#' + id));
      return;
    }
    console.log(data);
    const $page = $('<div>').attr('id', id).addClass('page');
    const $title = $('<div>').addClass('billTitle').text(data.display_number);
    const $info = $('<div>').addClass('billData');
    const $description = $('<p>').text(data.title_without_number);
    const $sponsors = $('<div>');
    const $coSponsors = $('<div>').addClass('row pad20');
    const path = 'https://www.govtrack.us/api/v2/role?current=true&person=';
    const votesPath = 'https://www.govtrack.us/api/v2/vote?sort=-created&related_bill='
    const query = data.sponsor.id;

    $sponsors.append($('<h5>').text('Sponsor'));

    ajax(preCacheMember, path, query);

    $sponsors.append(renderSmallCard(data.sponsor.bioguideid, data.sponsor.name, data.sponsor.id));

    if (data.cosponsors.length) {
      $sponsors.append($('<h5>').text('Cosponsors'));
      for (const sponsor of data.cosponsors) {
        const query2 = sponsor.id;

        ajax(preCacheMember, path, query2);

        $coSponsors.append(renderSmallCard(sponsor.bioguideid, sponsor.name, sponsor.id));
      }
    }

    $sponsors.append($coSponsors);

    ajax(renderBillVotes,votesPath,id,id);

    $info.append($description);
    $info.append($sponsors);

    $page.append($title);
    $page.append($info);
    $('main').append($page);
    openPage($page);
  }

// PAGE FUNCTIONS

  const openMyReps = function(){
    const path = 'https://www.govtrack.us/api/v2/role?current=true&limit=999&sort=person';
    $('.button-collapse').sideNav('hide');
      if (!myInfo.state || !myInfo.district) {
      Materialize.toast('Please enter your address', 4000);
      return;
    }
    empty();
    openPage($repContainer);
    ajax(renderMem, path, `&role_type=senator&state=${myInfo.state}`);
    ajax(renderMem, path, `&role_type=representative&state=${myInfo.state}&district=${myInfo.district}`);
  };

  const openVotes = function() {
    if ($('#recentVotes').children().length) {
      return;
    }

    const path = 'https://www.govtrack.us/api/v2/vote?sort=-created';
    const query = '';
    ajax(renderVotes, path, query, 'recentVotes');
  }

  const openBill = function (id) {
    const path = 'https://www.govtrack.us/api/v2/bill/' + id;
    const queries = '';
    ajax(renderBill, path, queries, id);
  }

// EVENT LISTENERS

  $('#recentVotes').on('click','.card', (event) => {
    let id;
    if (!$(event.target).attr('name')) {
      id = $(event.target).parents('.card').attr('name');
    } else {
      id = $(event.target).attr('name');
    }
    openBill(id);
  });

  $('#back').on('click', goBack);

  $('nav ul').on('click', 'a', (event) => {
    switch (event.target.id) {
      case 'zipLink':
        openPage($('#enterZip'));
        break;
      case 'myReps':
        openMyReps();
        break;
      case 'allReps':
        openPage($('#searchBox'));
        break;
      case 'bills' :
        openVotes();
        openPage($('#billBox'));
        break;
      default:
        break;
    }
  });

  $repFilters.on('submit', (event) => {
    event.preventDefault();
    const path = 'https://www.govtrack.us/api/v2/role?current=true&limit=999&sort=person';
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
    ajax(renderMem, path, filters);
  });

  $('#stateSwitch').on('change', () => {
    $('#stateCheckWrapper').toggleClass('hidden');
  });

  $('#optionBox').on('click', 'button', (event) =>{
    const path = 'https://www.govtrack.us/api/v2/role?current=true&limit=999&sort=person';
    const state = event.target.name.slice(0, 2);
    const district = event.target.name.slice(2, event.target.name.length);
    myInfo.state = state;
    myInfo.district = district;
    empty();
    openPage($repContainer);
    ajax(renderMem, path, `&role_type=senator&state=${state}`);
    ajax(renderMem, path, `&role_type=representative&state=${state}&district=${district}`);
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
    const path = 'https://api.geocod.io/v1/geocode?q=';
    const input = $('#enterZip input').val();
    const query = input + '&api_key=15850078f71371512517105178513041fff87f3&fields=cd';
    if (!input.trim()) {
      Materialize.toast('Please enter an address', 4000);
      return;
    }
    ajax(renderAddresses, path, query);
  });
  $(".button-collapse").sideNav();
})();
