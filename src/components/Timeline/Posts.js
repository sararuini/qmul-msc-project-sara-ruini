import React, { Component } from "react";

import { AuthUserContext } from "../Session";
import { withFirebase } from "../Firebase";
import PostList from "./PostList";

class Posts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      loading: false,
      posts: [],
      limit: 5,
    };
  }

  componentDidMount() {
    this.onListenForPosts();
  }

  onListenForPosts = () => {
    this.setState({ loading: true });

    this.props.firebase
      .posts()
      .orderByChild("createdAt")
      .limitToLast(this.state.limit)
      .on("value", (snapshot) => {
        const postObject = snapshot.val();

        if (postObject) {
          const postList = Object.keys(postObject).map((key) => ({
            ...postObject[key],
            uid: key,
          }));

          this.setState({
            posts: postList,
            loading: false,
          });
        } else {
          this.setState({ posts: null, loading: false });
        }
      });
  };

  componentWillUnmount() {
    this.props.firebase.posts().off();
  }

  onChangeText = (event) => {
    this.setState({ text: event.target.value });
  };

  onCreatePost = (event, authUser) => {
    this.props.firebase.posts().push({
      text: this.state.text,
      userId: authUser.uid,
      createdAt: this.props.firebase.serverValue.TIMESTAMP,
    });

    this.setState({ text: "" });

    event.preventDefault();
  };

  onEditPost = (post, text) => {
    const { uid, ...postSnapshot } = post;

    this.props.firebase.post(post.uid).set({
      ...postSnapshot,
      text,
      editedAt: this.props.firebase.serverValue.TIMESTAMP,
    });
  };

  onRemovePost = (uid) => {
    this.props.firebase.post(uid).remove();
  };

  onNextPage = () => {
    this.setState(
      (state) => ({ limit: state.limit + 5 }),
      this.onListenForPosts
    );
  };

  render() {
    const { text, posts, loading } = this.state;

    return (
      <AuthUserContext.Consumer>
        {(authUser) => (
          <div>

            <form onSubmit={(event) => this.onCreatePost(event, authUser)}>
              <input type="text" value={text} onChange={this.onChangeText} />
              <button type="submit">Create a post</button>
            </form>


            

            {loading && <div>Loading ...</div>}

            {posts && (
              <PostList
                authUser={authUser}
                posts={posts}
                onEditPost={this.onEditPost}
                onRemovePost={this.onRemovePost}
              />
            )}
            
            {!loading && posts && (
              <button type="button" onClick={this.onNextPage}>
                More
              </button>
            )}

            {!posts && <div>There are no posts ...</div>}
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

export default withFirebase(Posts);
