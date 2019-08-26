console.log("this is chat html");

let stompClient = "";
let username = "";
let senderName = "";
let chatText = "";
const messageArea = document.querySelector("#messageArea");
const sendBtn = document.querySelector("#sendBtn");
const errorMessage = document.querySelector("#error");

function getConnect() {
 const query = new URLSearchParams(window.location.search);
 username = query.get("name");
 console.log("username in chat", username);
 if (!username) {
  window.location.href = "/";
 }
 const socket = new SockJS("/ws");
 stompClient = Stomp.over(socket);
 stompClient.connect({}, isConnected, isError);
}
window.onload = getConnect();

function isConnected() {
 stompClient.subscribe("/topic/public", isMessageReceived);
 stompClient.send("/app/chat.addUser", {}, JSON.stringify({ sender: username, type: "JSON" }));
}
function isMessageReceived(payload) {
 const messageInfo = JSON.parse(payload.body);
 console.log("messageInfo", messageInfo);
 senderName = messageInfo.sender;

 const messageElement = document.createElement("li");
 console.log("messageElement", messageElement);
 switch (messageInfo.type) {
  case "JOIN":
   messageElement.classList.add("event-message");
   messageInfo.content = message.sender + " joined!";
  case "LEAVE":
   messageElement.classList.add("event-message");
   messageInfo.content = message.sender + " left!";
  default:
   messageElement.classList.add("chatMessage");
   const nameElement = document.createElement("div");
   const nameText = document.createTextNode(
    senderName + " " + moment(new Date().getTime()).format("LTS")
   );
   nameElement.appendChild(nameText);
   messageElement.appendChild(nameElement);
 }
 const textElement = document.createElement("p");
 chatText = document.createTextNode(messageInfo.content);
 textElement.appendChild(chatText);
 messageElement.appendChild(textElement);
 messageArea.appendChild(messageElement);
 messageArea.scrollTop = messageArea.scrollHeight;
}

function sendMessage() {
 const userInput = document.querySelector("#userInput");
 const userInputValue = userInput.value.trim();

 if (!userInputValue || !stompClient) {
  sendBtn.disabled;
 } else {
  const chatMessage = {
   sender: username,
   content: userInput.value,
   type: "CHAT"
  };
  stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
  userInput.value = "";
 }
}

function isError() {
 errorMessage.textContent = "Oppps there seems to be an error here, please try again";
 errorMessage.style["background-color"] = "red";
 errorMessage.style["border"] = "1px solid black";
}
function clearAll() {
 const nodes = document.querySelectorAll(".chatMessage");
 Array.prototype.forEach.call(nodes, node => {
  node.parentNode.removeChild(node);
 });
}
function logout() {
 window.location.href = "/";
}
