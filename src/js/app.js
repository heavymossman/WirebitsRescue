App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 10000000000000000,
  tokensSold: 0,
  tokensAvailable: 7500000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545'); //The port needs to be the same as Ganache
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  //The reason this works is because of the connectios in bs-config, this is were we set the src and the build/contracts (its not magic)
  initContracts: function() {
    $.getJSON("WirebitsTokenSale.json", function(wirebitsTokenSale) {
      App.contracts.WirebitsTokenSale = TruffleContract(wirebitsTokenSale);
      App.contracts.WirebitsTokenSale.setProvider(App.web3Provider);
      App.contracts.WirebitsTokenSale.deployed().then(function(wirebitsTokenSale) {
        console.log("Wirebits Token Sale Address:", wirebitsTokenSale.address);
      });
    }).done(function() {
      $.getJSON("WirebitsToken.json", function(wirebitsToken) {
        App.contracts.WirebitsToken = TruffleContract(wirebitsToken);
        App.contracts.WirebitsToken.setProvider(App.web3Provider);
        App.contracts.WirebitsToken.deployed().then(function(wirebitsToken) {
        console.log("Wirebits Token Address:", wirebitsToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },


  // Listen for events emitted from the contract
 listenForEvents: function() {
   App.contracts.WirebitsTokenSale.deployed().then(function(instance) {
     instance.Sell({}, {
       fromBlock: 0,
       toBlock: 'latest',
     }).watch(function(error, event) {
       console.log("event triggered", event);
       App.render();
     })
   })
 },


  render: function(){

    if (App.loading) {
      return;
    }
    App.loading = true;

    const loader  = $('#loader');
    const content = $('#content');

    loader.show();
    content.hide();


    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your MetaMask or other browser wallet ETH Account address: " + account);
      }
    })

    App.contracts.WirebitsTokenSale.deployed().then(function(instance){
      wirebitsTokenSaleInstance = instance;
      return wirebitsTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return wirebitsTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber(); //change this to a number to test the progress bar
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      //This will generate a percentage which we can update the progress bar with
      let progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.WirebitsToken.deployed().then(function(instance) {
        wirebitsTokenInstance = instance;
        return wirebitsTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();

      })
    })


  },

  //This will handle the buying of tokens functionality
  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    let numberOfTokens = $('#numberOfTokens').val();
    App.contracts.WirebitsTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      alert("Congratulations, your purchase was a success")
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}


$(function() {
  $(window).load(function() {
    App.init();
  })
});
