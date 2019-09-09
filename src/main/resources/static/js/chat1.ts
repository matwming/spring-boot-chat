console.log("this is chat html");
// this is unfinished typescript file,please refer to chat.js not chat1.ts
let stompClient: string = "";
let username: string = "";
let senderName: string = "";
let chatText: string = "";

const messageArea: HTMLElement | null = document.querySelector("#messageArea");
const sendBtn: HTMLButtonElement | null = document.querySelector("#sendBtn");
const errorMessage: HTMLElement | null = document.querySelector("#error");
const currentUsers = new Set();
function getConnect() {
 const query = new URLSearchParams(window.location.search);
 const name: string = query.get("name") as string;
 if (Boolean(query.get("name"))) {
  username = name;
 } else {
  alert("please enter your name!");
  window.location.href = "/";
 }

 currentUsers.add(username);
 console.log(currentUsers);
 const welcomeMessage = document.createElement("p");
 welcomeMessage.textContent = `welcome, ${username}`;
 const welcomeElement: HTMLElement | null = document.getElementById("welcome");
 if (welcomeElement !== null) {
  welcomeElement.appendChild(welcomeMessage);
 }

 const socket = new SockJS("/ws");
 stompClient = Stomp.over(socket);
 stompClient.connect({}, isConnected, isError);
}
window.onload = getConnect();

function isConnected() {
 stompClient.subscribe("/topic/public", isMessageReceived);
 stompClient.send("/app/chat.addUser", {}, JSON.stringify({ sender: username, type: "JOIN" }));
}
function isMessageReceived(payload: { body: any }) {
 let messageInfo = JSON.parse(payload.body);
 console.log("messageInfo", messageInfo);
 senderName = messageInfo.sender;
 if (Boolean(senderName)) {
  currentUsers.add(senderName);
  console.log(currentUsers);
  const showUsersArea = document.getElementById("currentUsers");
  if (showUsersArea) {
   showUsersArea.innerHTML = "";
  }
  for (let [key, value] of currentUsers.entries()) {
   const currentUser = document.createElement("section");
   currentUser.id = key;
   currentUser.classList.add("currentUser");
   currentUser.textContent = key;
   showUsersArea && showUsersArea.appendChild(currentUser);
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
  if (selectedUser && selectedUser.parentNode) {
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
