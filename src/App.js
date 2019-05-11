import React, { Component } from 'react';

import './App.css';
import 'sweetalert/dist/sweetalert.css'
import "tabler-react/dist/Tabler.css";
import { 
  Grid, 
  Header, 
  Tab, 
  TabbedCard, 
  Form, 
  Button,
  Text,
  Card,
  Alert,
  StatsCard
} from "tabler-react";
import LaddaButton, { EXPAND_LEFT } from 'react-ladda';
import SweetAlert from 'sweetalert-react';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      voteFor: 'republican'
    }
  }

  transferProperty = async (e) => {
    e.preventDefault()

    if(!this.state.authorized) {
      this.setState({
        transferError: 'You are not authorized',
      })

      return;
    }

    if(!this.state.newOwner || !this.state.propertyId) {
      this.setState({
        transferError: 'Details missing',
      })

      return;
    }

    this.setState({
      transferLoading: true
    })

    let result = await (await fetch('http://ec2-52-90-174-194.compute-1.amazonaws.com:3000/signMessage', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "privateKey": this.state.privateKey,
        "message": JSON.stringify({
          "action": "transfer",
          "to": this.state.newOwner
        })
      })
    })).json()

    if(!result.error) {
      let signature = result.message

      result = await (await fetch('http://ec2-52-90-174-194.compute-1.amazonaws.com:3001/transferProperty', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature,
          propertyId: this.state.propertyId,
          newOwner: this.state.newOwner
        })
      })).json()

      if(!result.error) {
        this.setState({
          transferError: '',
          transferSuccess: true
        })
      } else {
        this.setState({
          transferError: 'An error occured'
        })
      }
    } else {
      this.setState({
        transferError: 'An error occured'
      })
    }

    this.setState({
      transferLoading: false
    })
  }

  vote = async (e) => {
    e.preventDefault()

    if(!this.state.authorized) {
      this.setState({
        voteError: 'You are not authorized',
      })

      return;
    }

    if(!this.state.voteFor) {
      this.setState({
        voteError: 'Details missing',
      })

      return;
    }
    

    this.setState({
      voteLoading: true
    })

    let result = await (await fetch('http://ec2-52-90-174-194.compute-1.amazonaws.com:3000/signMessage', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "privateKey": this.state.privateKey,
        "message": JSON.stringify({
          "action": "vote",
          "to": this.state.voteFor
        })
      })
    })).json()

    if(!result.error) {
      let signature = result.message

      result = await (await fetch('http://ec2-52-90-174-194.compute-1.amazonaws.com:3002/vote', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature,
          president: this.state.voteFor,
          userId: this.state.id
        })
      })).json()

      if(!result.error) {
        this.setState({
          voteError: '',
          voteSuccess: true
        })
      } else {
        this.setState({
          voteError: 'An error occured'
        })
      }
    } else {
      this.setState({
        voteError: 'An error occured'
      })
    }

    this.setState({
      voteLoading: false
    })
  }

  grantAccess = async (e) => {
    e.preventDefault()

    if(!this.state.authorized) {
      this.setState({
        grantAccessError: 'You are not authorized',
      })

      return;
    }

    if(!this.state.serviceProvider) {
      this.setState({
        grantAccessError: 'Details missing',
      })

      return;
    }
    

    this.setState({
      grantAccessLoading: true
    })

    let result = await (await fetch('http://ec2-52-90-174-194.compute-1.amazonaws.com:3000/grantAccess', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceProviderPublicKey: this.state.serviceProvider,
        privateKey: this.state.privateKey,
        id: this.state.id
      })
    })).json()

    if(!result.error) {
      this.setState({
        grantAccessError: '',
        grantAccessSuccess: true
      })
    } else {
      this.setState({
        grantAccessError: 'An error occured'
      })
    }

    this.setState({
      grantAccessLoading: false
    })
  }

  authorize = async (e) => {
    e.preventDefault()

    if(!this.state.id || !this.state.privateKey) {
      this.setState({
        authorizeError: 'Please enter all details',
        authorized: false
      })
    } else {
      this.setState({
        id: this.state.id,
        privateKey: this.state.privateKey,
        authorized: true
      })
    }
  }

  handleChanges = e => {
    this.setState({
        [e.target.name]: e.target.value,
    });
  };

  render() {
    return (
      <Grid.Row>
        <Grid.Col className="mb-4" offset={3} width={6}>
          <Header.H1 className="mt-4">User Card and Authentication Device Simulation</Header.H1>
          <TabbedCard initialTab="Authorize">
            <Tab title="Authorize">
              {!this.state.authorized &&
                <div>
                  <Text className="mb-4">This form simulates the scenerio when you scan your card using authentication device to proof your identity and grant access to your data</Text>
                  <Form onSubmit={this.authorize} className="mb-4">
                    <Form.Input name='id' label='ID' placeholder='Enter ID' onChange={this.handleChanges} />
                    <Form.Input name='privateKey' label='Private Key' placeholder='Enter Private Key' onChange={this.handleChanges} />
                    {this.state.authorizeError &&
                      <Alert type="danger">
                        {this.state.authorizeError}
                      </Alert>
                    }
                    <LaddaButton
                      type="submit"
                      data-style={EXPAND_LEFT}
                      className="btn btn-primary"
                    >
                      Authorize
                    </LaddaButton>
                  </Form>
                </div>
              }

              {this.state.authorized &&
                <StatsCard layout={1} movement={''} total="✓" label="You are Authorized" />
              }
              
            </Tab>
            <Tab title="Transfer Property">
              <Form onSubmit={this.transferProperty} className="mb-4">
                <Form.Input name='propertyId' label='Property ID' placeholder='Enter Property ID' onChange={this.handleChanges} />
                <Form.Input name='newOwner' label='New Owner' placeholder='Enter New Owner ID' onChange={this.handleChanges} />
                {this.state.transferError &&
                  <Alert type="danger">
                    {this.state.transferError}
                  </Alert>
                }
                <LaddaButton
                  loading={this.state.transferLoading}
                  type="submit"
                  data-style={EXPAND_LEFT}
                  className="btn btn-primary"
                >
                  Transfer
                </LaddaButton>
                <SweetAlert
                  show={this.state.transferSuccess}
                  title="Success"
                  text="Property transferred to new owner"
                  onConfirm={() => this.setState({ transferSuccess: false })}
                />
              </Form>
            </Tab>
            <Tab title="Vote">
              <Form onSubmit={this.vote} className="mb-4">
                <Form.Group>
                  <Form.Select name='voteFor' label='Vote For' onChange={this.handleChanges}>
                    <option value="republican">
                      Republican Party
                    </option>
                    <option value="democratic">
                      Democratic Party
                    </option>
                  </Form.Select>
                </Form.Group>
                {this.state.voteError &&
                  <Alert type="danger">
                    {this.state.voteError}
                  </Alert>
                }
                <LaddaButton
                  loading={this.state.voteLoading}
                  type="submit"
                  data-style={EXPAND_LEFT}
                  className="btn btn-primary"
                >
                  Vote
                </LaddaButton>
                <SweetAlert
                  show={this.state.voteSuccess}
                  title="Success"
                  text="Vote is successfully posted"
                  onConfirm={() => this.setState({ voteSuccess: false })}
                />
              </Form>
            </Tab>
            <Tab title="Grant Access">
              <Form onSubmit={this.grantAccess} className="mb-4">
                <Form.Input name='serviceProvider' label='Service Provider' placeholder='Enter Service Provider Public Key' onChange={this.handleChanges} />
                {this.state.grantAccessError &&
                  <Alert type="danger">
                    {this.state.grantAccessError}
                  </Alert>
                }
                <LaddaButton
                  loading={this.state.grantAccessLoading}
                  type="submit"
                  data-style={EXPAND_LEFT}
                  className="btn btn-primary"
                >
                  Grant Access
                </LaddaButton>
                <SweetAlert
                  show={this.state.grantAccessSuccess}
                  title="Success"
                  text="Access Granted Successfully"
                  onConfirm={() => this.setState({ grantAccessSuccess: false })}
                />
              </Form>
            </Tab>
          </TabbedCard>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default App;
