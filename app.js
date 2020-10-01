let loggedOut = true;
// OBJECT CONSTRUCTORS
const User = function(username,password,imgId,balance,level){
    this.username = username;
    this.password = password;
    this.imgId = imgId;
    this.balance = balance;
    this.level = level;
}

const DepOrWith = function (date,type,user,amount) {
    this.date = date;
    this.type = type;
    this.user = user;
    this.amount = amount;
}

const Send = function(date, from, to, amount) {
    this.date = date;
    this.from = from;
    this.to = to;
    this.amount = amount;
}

// INITIAL USERS/DUMMY USERS
const userTest1 = new User("user","password",1,20000,0);
const userTest2 = new User("charles","samoy",2,105000,0);
const userTest3 = new User("test","test",3,1000000,0);
const admin = new User("admin","admin",4,999999999,1);

// DATA OBJECT FOR INFO STORAGE
const data = {
    allUsers: [userTest1,userTest2,userTest3,admin],
    currentUser: {
        username : "",
        imgId : 0,
        balance : 0,
        level: 0
    },
    transactions: {
        send: [],
        deporwith: []
    }
}

//BACKEND CONTROLLER
const backEndController = {
    create_user : function(username,password) {
        const newID = Math.floor(Math.random() * 6)+1;
        const newUser = new User(username,password,newID,0,0);
        data.allUsers.push(newUser);
    },
    
    deposit: function(user,amount) {
        let newBalance;
        newBalance = user.balance+amount;
        user.balance = newBalance;
        return newBalance;
    },

    withdraw: function(user,amount) {
        let newBalance;
        newBalance = user.balance-amount;
        user.balance = newBalance;
        return newBalance;
    },

    get_balance(user) {
        return user.balance;
    },

    send: function(from_user,to_user,amount) {
        let fromNew, toNew;
        fromNew = from_user.balance-amount;
        toNew = to_user.balance+amount;
        from_user.balance = fromNew;
        to_user.balance = toNew;
    },

    //CHECKS IF USERNAME AND PASSWORD IS IN THE DATA
    check_user : function(checkUserName,password) {
        for (current of data.allUsers) {
            if (current.username === checkUserName && current.password === password) {
                data.currentUser.username = current.username;
                data.currentUser.imgId = current.imgId;
                data.currentUser.balance = current.balance;
                data.currentUser.level = current.level;
                return true;
            }
        }
        return false;
    },

    //CHECKS IF USERNAME IS TAKEN
    check_available_username: function(checkUserName){
        for(current of data.allUsers) {
            if(current.username === checkUserName) {
                return false;
            }
        }
        return true;
    },

    //RETURNS USER OBJECT BASED ON USERNAME
    find_user: function(name){
        for (current of data.allUsers){
            if(current.username===name){
                return current;
            }
        }
    },

    //UPDATES CURRENT USER FROM DATA OBJECT
    updateCurrent : function(user) {
        data.currentUser.username = user.username;
        data.currentUser.imgId = user.imgID;
        data.currentUser.balance = user.balance;
        data.currentUser.level = user.level;
    },

    //RESETS CURRENT USER FROM DATA OBJECT WHEN LOGGED OUT (POSSIBLY FOR SECURITY?)
    resetCurrentUser: function() {
        data.currentUser.username = "";
        data.currentUser.imgId = 0;
        data.currentUser.balance = 0;
        data.currentUser.level = 0;
    },

    //UPDATES USER BALANCE BASED ON CURRENT USER
    updateUserBalance: function() {
        for(current of data.allUsers) {
            if(current.username === data.currentUser.username){
                current.balance = data.currentUser.balance;
                break;
            }
        }
    },
    
    //handles all transaction saves it in the database
    handleTransactions: function(type,from,to,amount) {
        let now,month,year,date,newTransaction;

        now = new Date();
        date = now.getDay();
        month = now.getMonth();
        year = now.getFullYear();
        date = month + '/' + date + '/' + year;

        if(type==="withdraw" || type==="deposit"){
            newTransaction = new DepOrWith(date,type,from,amount);
            data.transactions.deporwith.push(newTransaction);
        } else if (type==="send"){
            newTransaction = new Send(date,from,to,amount);
            data.transactions.send.push(newTransaction);
        }
    }
}

//OBJECT CONTAINING ALL IDS AND CLASS NAMES FOR EASIER QUERY SELECTOR
const DOMStrings = {
    bankIcon: ".bank-icon",
    loginPageBtn: '#login-page-btn',
    registerBtn: '#register-page-btn',
    logOutBtn: '#logout-btn',
    goHomeBtn: '.home-btn',
    landingPage: '.landing-page',
    loginPage: '.login-page',
    regPage: '.reg-page',
    loggedIn: '.logged-in-page',
    loginUsername: '#username',
    loginPassword: '#password',
    loginBtn: '.login-btn',
    regBtn: '.reg-btn',
    regUserName: '#newUsername',
    regPassword: '#newPassword',
    regConfirmPW: '#newPassword2',
    loggedinPage: '.logged-in-page',
    adminPage: '.admin-page',
    homePage: '.home-page',
    depWithPage: '.deposit-withdraw-page',
    sendMoneyPage: '.send-money-page',
    landingBtns: '.landing-btns',
    loggedInBtns: '.logged-in-btns',
    depWithPageBtn: '.deposit-withdraw-btn',
    sendPageBtn: '.send-money-btn',
    backBtn:'.back-btn',
    submitDepWith:'.submit-depwith',
    submitTransfer:'.submit-transfer',
    depOrWith: '.dep-or-with',
    amountDepWith: '.amount-to-depwith',
    selectBox: '.to_user_choice',
    amountTransfer: '.amount-to-transfer',
    listOfUsers: '.list-of-users',
    listOfDepWith: '.list-of-depwith',
    listOfTransactions: '.list-of-transactions',
    adminUserCount: '.admin-usercount',
    adminTransactionCount: '.admin-transactions'
}

//FORMATS NUMBER (10000 -> 10,000.00 etc.)
const formatNumber = function(num) {
    let result, int, dec;

    num = Math.abs(num).toFixed(2);

    result = num.split('.');

    int = result[0];
    if (int.length > 6) {
        int = int.substr(0,int.length-6) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length-3,3);
    } else if (int.length>3) {
        int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
    }

    dec = result[1];

    return int + '.' + dec;
}

//FRONT END CONTROLLER
const frontEndController = {
    //GET INPUTS OF EACH FORM
    getLoginInputs: function() {
        return {
            username : document.querySelector(DOMStrings.loginUsername).value,
            password : document.querySelector(DOMStrings.loginPassword).value
        }
    },

    getRegInputs: function() {
        return {
            username: document.querySelector(DOMStrings.regUserName).value,
            password: document.querySelector(DOMStrings.regPassword).value,
            confirmPassword: document.querySelector(DOMStrings.regConfirmPW).value
        }
    },

    getDepWithInputs: function() {
        return {
            selected: document.querySelector(DOMStrings.depOrWith).value,
            amount: parseFloat(document.querySelector(DOMStrings.amountDepWith).value)
        }
    },

    getTransferInputs: function() {
        return {
            username: document.querySelector(DOMStrings.selectBox).value,
            balance: parseFloat(document.querySelector(DOMStrings.amountTransfer).value)
        }
    },

    //CLEAR ALL FIELDS
    clearFields: function() {
        let fields, fieldsArr;

        fields = document.querySelectorAll('input');
        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current){
            current.value="";
        });
    },

    //UPDATES ICON,NAME,AND AMOUNT IN FRONTEND BASED ON CURRENT USER
    personalizePage: function() {
        const icon = document.querySelector('.user-icon');
        const name = document.querySelector('.greeting-home');
        const amount = document.querySelectorAll('.balance-amount');
        const user = data.currentUser;
        
        icon.src=`images/icons/icon${user.imgId}.png`;
        name.textContent=`Welcome, ${user.username}!`;
        amount.forEach(function(current){
            current.textContent=formatNumber(user.balance);
        });
    },

    //UPDATES THE SELECT OPTIONS FOR TRANSFERRING (CAN'T TRANSFER TO ADMIN ACCOUNTS AND OWN ACCOUNT)
    updateChoicesForTransfer: function() {
        const selectBox = document.querySelector(DOMStrings.selectBox);
        const usernames = data.allUsers;

        selectBox.innerHTML = '';
        
        usernames.forEach(function(current){
            if(current.username !== data.currentUser.username && current.level !==1){
                const newOption = document.createElement('option');
                const optionText = document.createTextNode(current.username);
                newOption.appendChild(optionText);
                newOption.setAttribute('value',current.username);
                selectBox.appendChild(newOption);
            };
        });
    },

    //updates tables for new transactions and new users.
    updateAdminLists : function() {
        let html,type;

       const listUsers = document.querySelector(DOMStrings.listOfUsers);
       const listDepWith = document.querySelector(DOMStrings.listOfDepWith);
       const listTransactions = document.querySelector(DOMStrings.listOfTransactions);

       listUsers.innerHTML = '<tr><th>Username</th><th>Password</th><th>Balance</th></tr>'
       listDepWith.innerHTML = '<tr><th style="width:100px">Date of <br>Transaction</th><th style="width:75px;">Type</th><th style="width: 75px;">User</th><th>Amount</th><tr>';
       listTransactions.innerHTML = '<tr><th style="width:100px">Date of <br>Transaction</th><th style="width:75px;">From User</th><th style="width: 75px;">To User</th><th>Amount</th><tr>';

        
        for (current of data.allUsers) {
            if(current.level!==1){
                html = `<td>${current.username}</td><td>${current.password}</td><td>P${formatNumber(current.balance)}</td>`;
                listUsers.insertAdjacentHTML('beforeend',html);
            }
        };

        for (current of data.transactions.deporwith) {
            if(current.type==="deposit"){
                type = "Deposit";
            } else {
                type = "Withdraw"
            }
            html = `<td>${current.date}</td><td>${type}</td><td>${current.user}</td><td>P${current.amount}</td>`;
            listDepWith.insertAdjacentHTML('beforeend',html);
        };

        for (current of data.transactions.send) {
            html = `<td>${current.date}</td><td>${current.from}</td><td>${current.to}</td><td>P${current.amount}</td>`;
            listTransactions.insertAdjacentHTML('beforeend',html);
        }
    },

    //Updates user count and transaction count in admin page
    updateAdminPage: function(){
        const userCount = document.querySelector(DOMStrings.adminUserCount);
        const transactionCount = document.querySelector(DOMStrings.adminTransactionCount);
        let userCounter=0;

        for(current of data.allUsers){
            if(current.level!==1){
                userCounter++;
            }
        }

        userCount.innerHTML=userCounter;
        transactionCount.innerHTML=data.transactions.deporwith.length+data.transactions.send.length;
    },

    //HANDLES ALL BUTTONS' NAVIGATION
    changePage : function(event) {
        const landingPage = document.querySelector(DOMStrings.landingPage);
        const regPage = document.querySelector(DOMStrings.regPage);
        const loginPage = document.querySelector(DOMStrings.loginPage);
        const loggedinPage = document.querySelector(DOMStrings.loggedinPage);
        const homePage = document.querySelector(DOMStrings.homePage);
        const adminPage = document.querySelector(DOMStrings.adminPage);
        const landingBtns = document.querySelector(DOMStrings.landingBtns);
        const loggedInBtns = document.querySelector(DOMStrings.loggedInBtns);
        const depWithPage = document.querySelector(DOMStrings.depWithPage);
        const sendMoneyPage = document.querySelector(DOMStrings.sendMoneyPage);

        landingPage.style.visibility="hidden";
        loginPage.style.visibility="hidden";
        regPage.style.visibility="hidden";
        loggedinPage.style.visibility="hidden";
        homePage.style.visibility="hidden";
        adminPage.style.visibility="hidden";
        depWithPage.style.visibility="hidden";
        sendMoneyPage.style.visibility="hidden";

        if (event.target.id === "login-page-btn" || event.target.classList.value === "reg-btn"){
            loginPage.style.visibility="visible";
        } else if (event.target.id === "register-page-btn"){
            regPage.style.visibility="visible";
        } else if (event.target.classList.value === 'home-btn'){
            landingPage.style.visibility="visible";
        } else if (event.target.classList.value === "login-btn"){
            if(data.currentUser.level===1){
                adminPage.style.visibility="visible";
            } else if(data.currentUser.level===0){
                loggedinPage.style.visibility="visible";
                homePage.style.visibility="visible";
            } else {
                console.log('what happened here');
            }
            landingBtns.style.visibility="hidden";
            loggedInBtns.style.visibility="visible";
        } else if (event.target.id === "logout-btn"){
            alert("You have successfully logged out!");
            loggedInBtns.style.visibility="hidden";
            landingBtns.style.visibility="visible";
            landingPage.style.visibility="visible";
        } else if (event.target.classList.value === "deposit-withdraw-btn"){
            depWithPage.style.visibility="visible";
        } else if (event.target.classList.value ==="send-money-btn"){
            sendMoneyPage.style.visibility="visible";
        } else if (event.target.classList.value === "back-btn" || event.target.classList.value === "submit-depwith" || event.target.classList.value === "submit-transfer"){
            homePage.style.visibility="visible";
        } else if (event.target.parentNode.classList.value === "bank-icon") {
            if(loggedOut){
                landingPage.style.visibility="visible";
            }else{
                homePage.style.visibility="visible";
            }
        }
    }
}


//GLOBAL CONTROLLER
const controller = (function(backEndController,frontEndController) {
    //SETUP ALL EVENT LISTENERS
    const setUpEventListeners = function () {
        document.querySelector(DOMStrings.bankIcon).addEventListener('click',handleNavigation);

        document.querySelector(DOMStrings.loginPageBtn).addEventListener('click',handleNavigation);
        document.querySelector(DOMStrings.registerBtn).addEventListener('click',handleNavigation);
        document.querySelector(DOMStrings.logOutBtn).addEventListener('click',handleNavigation);
        document.querySelectorAll(DOMStrings.goHomeBtn).forEach(function(current){
            current.addEventListener('click',handleNavigation);
        });

        document.querySelector(DOMStrings.loginBtn).addEventListener('click',loginHandler);
        document.querySelector(DOMStrings.regBtn).addEventListener('click',regHandler);

        document.querySelector(DOMStrings.depWithPageBtn).addEventListener('click',handleNavigation);
        document.querySelector(DOMStrings.sendPageBtn).addEventListener('click',handleNavigation);
        document.querySelectorAll(DOMStrings.backBtn).forEach(function(current){
            current.addEventListener('click',handleNavigation);
        });

        document.querySelector(DOMStrings.submitDepWith).addEventListener('click',depWithHandler);
        document.querySelector(DOMStrings.submitTransfer).addEventListener('click',transferHandler);
    }

    //HANDLES LOGIN, CHECKS USERNAME AND PASSWORD, CHANGES PAGE IF CORRECT.
    const loginHandler = function(event) {
        const loginAttempt = frontEndController.getLoginInputs();
        if (backEndController.check_user(loginAttempt.username,loginAttempt.password)){
            frontEndController.personalizePage();
            if (data.currentUser.level===1){
                frontEndController.updateAdminLists();
                frontEndController.updateAdminPage();
            }
            loggedOut=false;
            frontEndController.changePage(event);
        } else {
            alert("Wrong username or password! Please try again.");
        }
        frontEndController.clearFields();
    }


    //HANDLES REG. MAKES SURE USERNAME ISN'T IN DATABASE
    const regHandler = function(event) {
        const regAttempt = frontEndController.getRegInputs();
        if(backEndController.check_available_username(regAttempt.username)) {
            if(regAttempt.confirmPassword === regAttempt.password) {
                backEndController.create_user(regAttempt.username,regAttempt.password);
                alert('User created! Please login now.');
                frontEndController.changePage(event);
            } else {
                alert('Confirm password and password is not the same. Please try again.')
            }
        } else {
            alert(`Username "${regAttempt.username}" is already taken. Please try another.`);
        }
        frontEndController.clearFields();
    }

    //HANDLES ALL DEPOSIT AND WITHDRAW FUNCTIONALITY
    const depWithHandler = function(event) {
        const depwithAttempt = frontEndController.getDepWithInputs();

        //CHECKS IFAMOUNT HAS BEEN FILLED IN, CHECKS IF MONEY IS ENOUGH FOR WITHDRAWING MONEY, UPDATES BALANCE, UPDATE PERSONALIZATION, CHANGE PAGE BACK TO HOME SCREEN.
        if(depwithAttempt.amount){
            if(depwithAttempt.selected === "withdraw"){
                if (data.currentUser.balance >= depwithAttempt.amount){
                    backEndController.withdraw(data.currentUser,depwithAttempt.amount);
                    backEndController.handleTransactions(depwithAttempt.selected,data.currentUser.username,null,formatNumber(depwithAttempt.amount));
                } else {
                    alert("Not enough cash please try again.");
                    frontEndController.clearFields();
                    return;
                }
            } else if (depwithAttempt.selected === "deposit"){
                backEndController.deposit(data.currentUser,depwithAttempt.amount);
                backEndController.handleTransactions(depwithAttempt.selected,data.currentUser.username,null,formatNumber(depwithAttempt.amount));
            }
            backEndController.updateUserBalance();
            frontEndController.personalizePage();
            frontEndController.changePage(event)
        } else{
            alert("No amount inputted please try again.")
        }
    }

    //HANDLES ALL TRANSFER/SENDING MONEY FUNCTIONALITY
    const transferHandler = function(event) {
        const transferAttempt = frontEndController.getTransferInputs();

        //CHECKS IF AMOUNT HAS BEEN FILLED IN, CHECKS IF MONEY IS ENOUGH TO TRANSFER, ASKS FOR CONFIRMATION, GOES BACK TO HOME SCREEN
        if(transferAttempt.balance){
            if(transferAttempt.balance <= data.currentUser.balance){
                const confirmTransfer = confirm(`Are you sure you want to transfer ${formatNumber(transferAttempt.balance)} pesos to ${transferAttempt.username}?`);
                if(confirmTransfer){
                    backEndController.send(data.currentUser,backEndController.find_user(transferAttempt.username),transferAttempt.balance);
                    backEndController.handleTransactions("send",data.currentUser.username,transferAttempt.username,formatNumber(transferAttempt.balance));
                    backEndController.updateUserBalance();
                    frontEndController.personalizePage();
                    frontEndController.changePage(event);
                }
            } else {
                alert("Not enough cash. Please try again.")
            }
        } else{
            alert("No amount inputted please try again.")
        }
        frontEndController.clearFields();
    }

    //HANDLES ALL NAVIGATION, HANDLES FUNCTIONS WHEN LOGOUT AND GOING TO TRANSFER MONEY, CHANGES PAGE.
    const handleNavigation = function(event) {
        if(event.target.id==="logout-btn"){
            backEndController.resetCurrentUser();
            loggedOut=true;
        } else if (event.target.classList.value==="send-money-btn"){
            frontEndController.updateChoicesForTransfer();
        }
        
        frontEndController.changePage(event);
        frontEndController.clearFields();
    }

    //INITIALIZATION JUST SETUP EVENT LISTENERS EVERYTHING IS CONNECTED FROM THERE.
    return {
        init: function() {
            setUpEventListeners();
        }
    }
})(backEndController,frontEndController);

controller.init();