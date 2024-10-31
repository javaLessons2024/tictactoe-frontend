var url = "http://localhost:8080";

var link = document.createElement("link");
link.rel = "stylesheet";
link.href = './Login_register/login.css'; 
document.head.appendChild(link);


export async function createLoginContainer(containerID){

    const main_containter = document.getElementById(containerID);
    main_containter.innerHTML = "";
    
 
    const loginDiv = document.createElement('div');
    loginDiv.className = "login-container";
    loginDiv.id = "login-container";

        const heading = document.createElement('h1');
        heading.textContent = "TicTacToe";
        loginDiv.appendChild(heading);

        const usernameForm = document.createElement('div');
        usernameForm.className = "login-form";

            const usernameLabel = document.createElement('label');
            usernameLabel.setAttribute('for', 'username');
            usernameLabel.textContent = "Enter game name:";

            const usernameInput = document.createElement('input');
            usernameInput.type = "text";
            usernameInput.id = "username";
            usernameInput.name = "username";   

        usernameForm.appendChild(usernameLabel);
        usernameForm.appendChild(usernameInput);
        
    loginDiv.appendChild(usernameForm);
     
        const loginButtonDiv = document.createElement('div');
        loginButtonDiv.className = "login-form";

        const loginButton = document.createElement('button');
        loginButton.id = "login";
        loginButton.textContent = "Login";
        loginButton.onclick = async function(){
            let user = getUserData();   

            if(!checkIfNameValid(user.name)) return;
            
            window.location.href = "./tic-tac-toe.html?name=" + user.name;
            clearUserData();
        }

        loginButtonDiv.appendChild(loginButton);
    
    loginDiv.appendChild(loginButtonDiv);          
              
        const errorMessage = document.createElement('p');
        errorMessage.id = "errorMessage";

    loginDiv.appendChild(errorMessage);


    main_containter.appendChild(loginDiv);   
   
}

function checkIfNameValid(username) {
    let errorMessage = document.getElementById('errorMessage');
    if (username === "") {   
        errorMessage.textContent = "Invalid name";     
        return false;
    }
    return true;
}



function getUserData(){
    let user = {};
    user.name = document.getElementById("username").value;    
    return user;
}

function clearUserData(){


    
    document.getElementById("username").value = "";  
}

