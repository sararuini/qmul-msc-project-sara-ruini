import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import { AuthUserContext } from "../Session";
import BandList from "./BandList";

import bandStyle from "./styles";
import { View, Text } from "react-native-web";

class Bands extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bands: [],
      limit: 5,
      loading: false,
      bandName: "",
      userRole: "",
    };
  }

  componentDidMount = () => {
    this.setState({ loading: true });
    this.loadBands();
    this.setState({ loading: false });
  };

  componentWillUnmount = () => {
    this.props.firebase.bands().off();
  };

  createBand = (event, authUser) => {
    const currentUser = this.props.firebase.auth.currentUser;
    const currentUserId = currentUser.uid;
    const ref = this.props.firebase.bands().push();
    const refKey = ref.key;
    console.log("ref " + refKey);
    
    ref.set({
      name: this.state.bandName,
      createdAt: this.props.firebase.serverValue.TIMESTAMP,
    });

    this.props.firebase.bandMember(refKey, currentUserId).set({
      joinedAt: this.props.firebase.serverValue.TIMESTAMP,
      userRole: this.state.userRole,
    });

    this.props.firebase.userBand(currentUserId, refKey).set({
        band: true,
      });

  };

  onChangeBandName = (event) => {
    this.setState({ bandName: event.target.value });
  };


  onSelectRole = (event) => {
    this.setState({userRole: event.target.value})
  }

  loadBands = () => {
    this.props.firebase.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        const currentUser = this.props.firebase.auth.currentUser;
        const currentUserId = currentUser.uid;

        this.props.firebase
          .bands()
          .orderByChild("createdAt")
          .limitToLast(this.state.limit)
          .on("value", (snapshot) => {
            const bandObj = snapshot.val();

            if (bandObj) {
              console.log(bandObj);
              const bandList = Object.keys(bandObj).map((key) => ({
                ...bandObj[key],
                uid: key,
              }));

              this.setState({
                bands: bandList,
              });
            } else {
              this.setState({ bands: null });
            }
          });
        console.log("loaded");
      }
    });
  };

  onNextPage = () => {
    this.setState((state) => ({ limit: state.limit + 10 }), this.loadBands);
  };

  render() {
    const { bands, loading, bandName, userRole} = this.state;
    const { authUser } = this.props;
    const isInvalid = userRole === "" || bandName === "";
    return (
      <AuthUserContext.Consumer>
        {(authUser) => (
          <div>
            <form onSubmit={this.createBand}>
            <Text style={bandStyle.header}>Band Name</Text>
              <input
                type="text"
                value={bandName}
                onChange={this.onChangeBandName}
              />
              <Text style={bandStyle.header}>Your role in the band: </Text>
              <input
                type="text"
                value={userRole}
                onChange={this.onSelectRole}
              />
              <button disabled={isInvalid}type="submit"><Text style={bandStyle.normal_text}>Create Band</Text></button>
            </form>

            {loading && <div><Text style={bandStyle.normal_text}>Loading ...</Text></div>}
            <div><Text style={bandStyle.header}> Bands: </Text></div>
            {bands && <BandList authUser={authUser} bands={bands} />}

            {!loading && bands && bands.length > 5 && (
              <button type="button" onClick={this.onNextPage}>
               <Text style={bandStyle.normal_text}> View more bands </Text>
              </button>
            )}

            {!bands && <div> <Text style={bandStyle.normal_text}> There are no bands ...</Text></div>}
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}
export default withFirebase(Bands);
