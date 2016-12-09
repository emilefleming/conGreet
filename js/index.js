(function() {
  'use strict';
  $('select').material_select();

  const $repFilters = $('#repFilters');
  const $repContainer = $('#repContainer');
  const $loadIn = $('<div>').addClass('determinate red');
  const $loadBar = $('<div>').addClass('progress white').append($loadIn);
  const $loader = $('<div>').addClass('loader').append($loadBar);
  const myInfo = {};
  const myReps = [];
  const tempReps = [];
  const watchedReps = [];
  const repData = {};
  const recentPages = [];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ]

// DATA MANIPULATION FUNCTION

  const formatTime = function(rawTime) {
    const today = new Date().toISOString();
    const todayArr = today.match(/(\d+)\-(\d+)\-(\d+)T(\d+)\:(\d+)\:(\d+)/);
    const timeArr = rawTime.match(/(\d+)\-(\d+)\-(\d+)T(\d+)\:(\d+)\:(\d+)/);
    let year = '';
    const month = months[parseInt(timeArr[2]) - 1];
    const time = `${parseInt(timeArr[4])}:${timeArr[5]}`;

    if (!timeArr.length) {
      return rawTime;
    }

    if (todayArr[1] !== timeArr[1]) {
      year = timeArr[1] + ' ';
    }


    return `${month} ${timeArr[3]}, ${year}${time} UTC`;
  }

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
    });
  }

// CACHE FUNCTIONS

  const cacheMemberCard = function(thisRep) {
    const picUrl = 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + thisRep.id + '.jpg'
    const $card = $('<div>').addClass('repCard');
    const $shortInfo = $('<div>').addClass('shortInfo');
    const $repInfo = $('<div>').addClass('repInfo');
    const $nameTag = $('<h4>').text(thisRep.name);
    const $actionBox = $('<div>').addClass('actionBox');
    const $callButton = $('<a>').addClass('btn action callBut');
    const $bioButton = $('<a>').addClass('btn action bioBut');

    $callButton.attr('href', 'tel:' + thisRep.phone);
    $callButton.append($('<i>').addClass('mdi mdi-phone'));
    $bioButton.attr('name', thisRep.id);
    $bioButton.append($('<i>').addClass('mdi mdi-account'));
    $actionBox.append($bioButton);
    $actionBox.append($callButton);
    $card.addClass('card').addClass(thisRep.party);

    $('<img>').attr('src', picUrl).addClass('headshot').appendTo($card);
    $('<span>').addClass('party').addClass(thisRep.party).text(' ' + thisRep.party).appendTo($nameTag);
    $repInfo.append($nameTag);
    $('<h5>').text(`${thisRep.description}`).appendTo($repInfo);

    $shortInfo.append($repInfo);
    $card.append($shortInfo);
    $shortInfo.append($actionBox);
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
    for (const result of response.results) {
      if (result.accuracy < 1) {
        return;
      }
      console.log(result);
      const $option = $('<div>').addClass('addrOption card');
      const state = result.address_components.state;
      const dist = result.fields.congressional_district.district_number;

      $option.attr('style', `background-image: url( https://maps.googleapis.com/maps/api/staticmap?center=${result.location.lat},${result.location.lng}&markers=size:mid|color:0xF44336|${result.location.lat},${result.location.lng}&zoom=14&size=400x200&scale=2&key=AIzaSyDtZ3kf0cXNDiUDBeYW1G3rhM6zcFJ5hh4)`);
      $option.attr('name', state + dist);
      $option.append($('<div>').text(result.formatted_address));
      $optionBox.append($option);
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

  const recentRepVotes = function(data, target) {
    target.append($('<h5>').text('Recent Votes'));
    for (const vote of data.objects) {
      target.append(renderVote(vote.vote, target));
    }
    tempReps.length = 0;
  }

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

    tempReps.push(repData[member].govTrackId);
    ajax(recentRepVotes, path, queries, $recentVotes);
    if (repData[member].youtube) {
      recentVideos(member)
    }

    $bioPage.append($profileData);
    $bioPage.appendTo($('main'));
    openPage($bioPage);
  }

  const renderMem = function(data, type, percTotal = 0, i = 0) {
    $('#repContainer').addClass('loading');
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

    if (type === 'myReps') {
      myReps.push(member.person.id);
    }

    $repContainer.append(thisRep.card.clone());
    percTotal += percEach * 100;
    const width = Math.round(percTotal) + '%';
    $loadIn.width(width);
    i++;
    window.setTimeout(()=> {
      renderMem(data, type, percTotal, i++)
    }, 1);
  }

  const renderRepVotes = function (data, target) {
    for (const voter of data.objects) {
      const $image = $('<img>').attr('src', 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + voter.person.bioguideid + '.jpg')
      const $vote = $('<div>').addClass('smallVote').append($image);
      const $voteType = $('<div>');

      if (voter.option.key === '+') {
        $voteType.addClass('yesVote')
      } else if (voter.option.key === '-') {
        $voteType.addClass('noVote')
      } else {
        $voteType.addClass('nullVote')
      }
      $vote.append($voteType);
      target.append($vote);
    }
  }

  const renderVotes = function (data, target) {
    for (const vote of data.objects) {
      target.append(renderVote(vote));
    };
  }

  const renderVote = function(vote) {
    const $card = $('<div>').addClass('card voteCard');
    const $titleBlock = $('<div>').addClass('titleBlock');
    const $title = $('<div>');
    if (vote.related_bill) {
      if (vote.related_bill.id) {
        $title.text(vote.related_bill.display_number);
        $card.attr('name', vote.related_bill.id);
      } else {
        $card.attr('name', vote.related_bill);
      }
    }
    const $result = $('<div>').text(vote.result);
    const $description = $('<p>').text(vote.question);
    const $date = $('<div>').text(formatTime(vote.created)).addClass('date');
    const $details = $('<p>').text(vote.question_details);
    const $breakdown = $('<div>').addClass('breakdown');
    const $voteBreakdown = $('<div>').addClass('voteBreakdown');
    const percentText = (vote.percent_plus * 100).toFixed(1) + '%';
    const $percent = $('<span>').text(percentText).appendTo($voteBreakdown);
    const $myRepsBox = $('<div>').addClass('myRepVotes');
    const allMyReps = myReps.concat(watchedReps);
    const path = 'https://www.govtrack.us/api/v2/vote_voter?vote=' + vote.id;

    if (tempReps.length) {
      let queries = '';
      for (const member of tempReps) {
        queries += '&person=' + member;
      }
      ajax(renderRepVotes, path, queries, $myRepsBox);
    }

    if (allMyReps.length) {
      const getVotesFor = allMyReps.filter((id) => {
        return id !== tempReps[0];
      })
      let queries = '';
      for (const member of getVotesFor) {
        queries += '&person=' + member;
      }
      ajax(renderRepVotes, path, queries, $myRepsBox);
    }

    $voteBreakdown.append($('<span>').text(vote.total_plus));
    $voteBreakdown.append($('<span>').text(vote.total_minus));
    $voteBreakdown.append($('<span>').text(vote.total_other));
    $breakdown.append($result);
    $breakdown.append($voteBreakdown);

    $titleBlock.append($title);
    $titleBlock.append($date);

    $card.append($titleBlock);
    $card.append($description);
    $card.append($details);
    $card.append($breakdown);
    $card.append($myRepsBox);
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
      $voteBox.append(renderVote(vote));
    }
    $('#' + id + ' .billData').append($voteBox);
  }

  const renderBill = function(data, id) {
    if ($('#' + id).length) {
      openPage($('#' + id));
      return;
    }
    const $page = $('<div>').attr('id', id).addClass('page');
    $('main').append($page);
    openPage($page);

    const $title = $('<div>').addClass('billTitle').text(data.display_number);
    const $info = $('<div>').addClass('billData');
    const $description = $('<p>').text(data.title_without_number);
    const $sponsors = $('<div>');
    const $sponsor = $('<div>').addClass('row pad20');
    const $coSponsors = $('<div>').addClass('row pad20');
    const path = 'https://www.govtrack.us/api/v2/role?current=true&person=';
    const votesPath = 'https://www.govtrack.us/api/v2/vote?sort=-created&related_bill='
    const query = data.sponsor.id;


    $sponsors.append($('<h5>').text('Sponsor'));
    $sponsor.append(renderSmallCard(data.sponsor.bioguideid, data.sponsor.name, data.sponsor.id));
    $sponsors.append($sponsor);
    ajax(preCacheMember, path, query);
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
  }

// PAGE FUNCTIONS

  const openMyReps = function(){
    const path = 'https://www.govtrack.us/api/v2/role?current=true&limit=999&sort=person';
    $('.button-collapse').sideNav('hide');
      if (!myInfo.state || !myInfo.district) {
        Materialize.toast('Please enter your address', 4000);
        openPage($('#enterZip'));
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
    ajax(renderVotes, path, query, $('#recentVotes'));
  }

  const openBill = function (id) {
    const path = 'https://www.govtrack.us/api/v2/bill/' + id;
    const queries = '';
    ajax(renderBill, path, queries, id);
  }

// EVENT LISTENERS

  $('main').on('click','.voteCard', (event) => {
    let id;
    if (!$(event.target).attr('name')) {
      id = $(event.target).parents('.voteCard').attr('name');
    } else {
      id = $(event.target).attr('name');
    }
    if (id) {
      openBill(id);
    }
  });

  $('#back').on('click', goBack);

  $('nav ul').on('click', 'a', (event) => {
    $('#sidenav-overlay').trigger( "click" );
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

  $('#optionBox').on('click', '.card', (event) =>{
    let id;
    if (!$(event.target).attr('name')) {
      id = $(event.target).parents('.addrOption').attr('name');
    } else {
      id = $(event.target).attr('name');
    }

    const path = 'https://www.govtrack.us/api/v2/role?current=true&limit=999&sort=person';
    const state = id.slice(0, 2);
    const district = id.slice(2, id.length);
    myInfo.state = state;
    myInfo.district = district;
    empty();
    openPage($repContainer);
    myReps.length = 0;
    ajax(renderMem, path, `&role_type=senator&state=${state}`, 'myReps');
    ajax(renderMem, path, `&role_type=representative&state=${state}&district=${district}`, 'myReps');
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
    $('.welcome').remove();
    $('#optionBox').empty();
    $('nav').removeClass('hidden');
  });
  $(".button-collapse").sideNav();
})();
