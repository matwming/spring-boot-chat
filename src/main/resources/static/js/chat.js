console.log("this is chat html");

let stompClient = "";
let username = "";
let senderName = "";
let chatText = "";
const messageArea = document.querySelector("#messageArea");
const sendBtn = document.querySelector("#sendBtn");
const errorMessage = document.querySelector("#error");
const currentUsers = new Set();
function getConnect() {
 const query = new URLSearchParams(window.location.search);
 username = query.get("name");
 console.log("username in chat", username);
 if (!Boolean(username)) {
  window.location.href = "/";
 }
 currentUsers.add(username);
 console.log(currentUsers);
 const welcomeMessage = document.createElement("p");
 welcomeMessage.textContent = `welcome, ${username}`;
 document.getElementById("welcome").appendChild(welcomeMessage);

 const socket = new SockJS("/ws");
 stompClient = Stomp.over(socket);
 stompClient.connect({}, isConnected, isError);
}
window.onload = getConnect();

function isConnected() {
 stompClient.subscribe("/topic/public", isMessageReceived);
 stompClient.send("/app/chat.addUser", {}, JSON.stringify({ sender: username, type: "JOIN" }));
}
function isMessageReceived(payload) {
 let messageInfo = JSON.parse(payload.body);
 console.log("messageInfo", messageInfo);
 senderName = messageInfo.sender;
 if (Boolean(senderName)) {
  currentUsers.add(senderName);
  console.log(currentUsers);
  const showUsersArea = document.getElementById("currentUsers");
  showUsersArea.innerHTML = "";
  for (let [key, value] of currentUsers.entries()) {
   const currentUser = document.createElement("section");
   currentUser.id = key;
   currentUser.classList.add("currentUser");
   currentUser.textContent = key;
   showUsersArea.appendChild(currentUser);
  }
 }
 const messageElement = document.createElement("li");
 console.log("messageElement", messageElement);
 console.log("messageInfo.type", messageInfo.type);
 if (messageInfo.type === "JOIN") {
  console.log("join");
  messageElement.classList.add("event-message");
  messageElement.classList.add("joined");
  messageInfo.content = messageInfo.sender + " joined!";
 } else if (messageInfo.type === "LEAVE") {
  console.log("leave");
  messageElement.classList.add("event-message");
  messageElement.classList.add("left");
  messageInfo.content = messageInfo.sender + " left!";
  const selectedUser = document.getElementById(`${messageInfo.sender}`);
  if (selectedUser.parentNode) {
   selectedUser.parentNode.removeChild(selectedUser);
  }
 } else {
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

const sendMessage = () => {
 const userInput = document.querySelector("#userInput");
 const userInputValue = userInput.value.trim();
 if (!Boolean(userInputValue)) return;
 const chatMessage = {
  sender: username,
  content: userInput.value,
  type: "CHAT"
 };
 stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
 userInput.value = "";
};

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
