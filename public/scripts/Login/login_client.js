import Msg from "../Chat/message_class.js";

export default class LoginClient {
  constructor() {
    this.username = null;
    this.password = null;
    this.id = 0;
    this.onVerification = null;
    this.onRegistration = null;
  }

  connect_socket(testingLocally) {
    this.socket = testingLocally
      ? new WebSocket("ws://localhost:9022")
      : new WebSocket("wss://ecv-etic.upf.edu/node/9022/ws/");

    this.socket.onopen = () => {
      console.log("Login Client is connected to the server");
    };

    this.socket.onerror = (error) => {
      console.log("Error: " + error);
    };

    this.socket.onclose = () => {
      console.log("Login Client: connection closed");
    };

    this.socket.onmessage = (message) => {
      console.log("Received message from login_server: " + message.data);
      var msg = JSON.parse(message.data);
      if (msg.type == "LOGIN") {
        this.onVerification(msg.content);
      }
      if (msg.type == "REGISTER") {
        this.onRegistration(msg.content);
      }
    };
  }

  sendForVerification(username, password) {
    var loginInfo = new Msg(
      -2,
      "login-client",
      { username: username, password: password },
      "LOGIN"
    );
    this.socket.send(JSON.stringify(loginInfo));
  }

  checkIfAvailable(username) {
    var msg = new Msg(-2, "register-client", { username: username }, "LOGIN");
    this.socket.send(JSON.stringify(msg));
  }

  sendRegistration(username, password) {
    var registerInfo = new Msg(
      -2,
      "register-client",
      { username: username, password: password },
      "REGISTER"
    );
    this.socket.send(JSON.stringify(registerInfo));
  }
}
