import io from "socket.io-client";

class SocketService {
    constructor() {
        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
    }
    connection;
    connect(user) {
        this.connection = io("http://localhost:7000", {
            query: `user=${user}`
        });
        this.connection.on("connect", this.onConnect);
        this.connection.on("events", this.onEvents);
        this.connection.on("exception", this.onException);
        this.connection.on("disconnect", this.onDisconnect);
    }

    onConnect() {
        console.log("Connected");

        this.connection.emit("events", { test: "test" });
        this.connection.emit("identity", 0, response =>
            console.log("Identity:", response)
        );
    }

    onDisconnect() {
        console.log("Disconnect");
    }

    onEvents(data) {
        console.log("event", data);
    }

    onException(data) {
        console.log("event", data);
    }
    setConnection() {}
}

export default new SocketService();
