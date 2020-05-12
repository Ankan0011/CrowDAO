import React, { Component } from "react";
import CrowDAO from "./contracts/crowdao.json";
import getWeb3 from "./getWeb3";
import { Button } from 'react-bootstrap';
import history from './history';
import Web3 from "web3";



class MyProposal extends Component {

	//state = { accounts: null , contract: null};
	state = { storageValue: 0, web3: null, accounts: null, contract: null,proposal_index : 0};
  
  componentDidMount = async () => {
    try {

      // Get network provider and web3 instance.
      //window.location.reload()
      console.log('entered reload before');
      const web3 = await getWeb3();
      web3.eth.handleRevert =true;
      const account = await web3.eth.getAccounts();
      console.log('account intialised'+account);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log('networkId intialised'+networkId);

      const deployedNetwork = CrowDAO.networks[networkId];
      const instance = new web3.eth.Contract(CrowDAO.abi, deployedNetwork && deployedNetwork.address);
      console.log("instance:" + deployedNetwork);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3: web3 ,accounts : account, contract: instance});
      //console.log("Contracts :"+this.state.contract);
      //this.interval = setInterval(() => this.setState({ time: new Date.now() }), 5000);
    //   if(this.isProposerOnly)   {this.loadProposal();}
    //   else {alert("Not authorised to view the page");}
    console.log("Sorry Sir, About to Load");
    this.loadProposal();
    } catch (error) {
      // Catch any errors for any of the above operations.
      //console.log(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    	}
      };
    
  
  isProposerOnly = async () => {
      var propLength;
      const { accounts, contract } = this.state;
      await contract.methods.getProposalCount().call().then(function(response){ propLength = response;});
      console.log(propLength);
      //This loop only display the active proposals only.
      var boolresp = false
      for(var i=0;i<=propLength-1;i++)
      {   
         
         if(boolresp==true){
            return true;
         } 
      }
    return false;
  };

  Completed = async(event) => {
    const { accounts, contract } = this.state;
    const i = event.target.value;
    await contract.methods.proposerCompleteVote(i,1).send({from:accounts[0]})
  }

  Aborted = async(event) => {
    const { accounts, contract } = this.state;
    const i = event.target.value;
    await contract.methods.proposerCompleteVote(i,2).send({from:accounts[0]}).then(function(error,response) {if(!error){console.log(response);} else{console.log(error)}})
  }

  loadProposal = async () => {

    var propLength;
    var fitresp;
    var passresp;
    var Procresp;
    var Abortresp;
    const { accounts, contract } = this.state;
    //console.log("This is for testing purpose only."+ proposal_index+" : "+vote_val);
    await contract.methods.getProposalCount().call().then(function(response){ propLength = response;});
    console.log(propLength);
    //This loop only display the active proposals only.
    var boolresp = false
    for(var i=0;i<=propLength-1;i++)
    {
    console.log(i);

    await contract.methods.didProposalPass(i).call().then(function(response){passresp = response;});
    console.log("crossed didProposalPass")
    await contract.methods.isProposer(i).call({from:accounts[0]}).then(function(response){ boolresp = response;});
    console.log("crossed isProposer")
    await contract.methods.getProposalByIndex(i).call().then(function(response){ fitresp = response;});
    console.log("crossed getProposalByIndex")
    /////await contract.methods.getProposalByIndex2(i).call().then(function(response){ Procresp = response[3];});
    await contract.methods.didProposalProcessed(i).call().then(function(response){ Procresp = response;});
    console.log("crossed didProposalProcessed")
    await contract.methods.didProposalAborted(i).call().then(function(response){ Abortresp = response;});
    console.log("for i"+ i +" Response "+ passresp+" am i the prosposer "+boolresp+" sd "+Procresp+" dsf "+Abortresp);
        if (boolresp==true && passresp == true && Procresp == false && Abortresp == false) 
        {
            var newRow=document.getElementById('AcceptanceTable').insertRow();
            // Insert a cell in the row at cell index 0
            var cell1   = newRow.insertCell(0);
            cell1.appendChild(document.createTextNode(fitresp[0]));
            // Insert a cell in the row at cell index 1

            var cell2   = newRow.insertCell(1);
            cell2.appendChild(document.createTextNode(fitresp[1]));

            var cell3   = newRow.insertCell(2);
            cell3.appendChild(document.createTextNode(fitresp[2]));

            //Accept Proposal Button
            var cell4   = newRow.insertCell(3);
            var button = document.createElement('button');
            button.innerHTML = 'Completed';
            button.onclick = this.Completed;
            button.id = "CompleteButton"+i;
            button.value = i;
            cell4.appendChild(button);

            //Refuse Proposal Button
            var center2 = document.createElement('center');
            var cell5   = newRow.insertCell(4);
            var button1 = document.createElement('button');
            button1.innerHTML = 'Abort';
            button1.onclick = this.Aborted;
            button1.id = "AbortButton"+i;
            button1.value = i;
            center2.appendChild(button1);
            cell5.appendChild(center2);
        }
    }
    };
  
       
handleUpdate = async() =>{
  try{
    console.log("trying to update the Accounts");
    const web3 = await getWeb3();
    const accounts =  await web3.eth.getAccounts();

    // Get the contract instance.
    const networkId = await web3.eth.net.getId();

    console.log("Accounts are:"+ accounts);

    const deployedNetwork = CrowDAO.networks[networkId];
    const instance = new web3.eth.Contract(CrowDAO.abi, deployedNetwork && deployedNetwork.address);
    //console.log("instance:" + deployedNetwork.address);

    // Set web3, accounts, and contract to the state, and then proceed with an
    // example of interacting with the contract's methods.
    this.setState({ web3, accounts, contract: instance });

    //console.log("Contracts:"+contract);
    this.props.history.push('/')
  } 
  
  catch (error) {
    // Catch any errors for any of the above operations.
    alert(
      `Failed to load web3, accounts, or contract. Check console for details.`,
    );
    console.error(error);
  }
};


    render() {
      window.ethereum.on('accountsChanged', this.handleUpdate);   
        return (
            <div>
            <h1>My Proposals</h1>
            <p>Your Address {this.state.accounts}</p>
            <div>
            <h3> Do the needful if you have completed the proposal</h3>
            </div>
            <div id= "container"> 
            <center>
                <table id="AcceptanceTable" border= "5"   width="50%"   cellpadding="4" cellspacing="3">	
                <tr> <th colspan="5"><h3>My Proposals List</h3></th></tr>
                <tr><th>ID</th><th>Proposal</th><th>Proposal Value</th><th>Task Completed</th><th> Task Unfinished</th></tr>
                </table>
            </center>
            </div>
        </div>
        );
    }
}

export default MyProposal;