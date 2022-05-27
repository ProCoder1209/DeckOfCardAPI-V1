let deckId = "";
let points = 0;
let enemyPoints = 0;
let playerCards = [];
let enemyCards = [];
window.onload = function() {
   document.getElementById("message").innerHTML = "<span class='title'>BlackJack</span><br><span class='smalltext'>Get more points than the dealer without going over 21 to win, if you do you lose (Busting). 2-9 are worth their number, 10's and faces are 10, and Ace is 11 unless it brings the total over 21 at which point it will be 1. Hit to draw a card and stand when you think you have enough.</span>";
   document.getElementById("dealbutton").style.display = "inline";
   document.getElementById("hitbutton").style.display = "none";
   document.getElementById("standbutton").style.display = "none";
   document.getElementById("enemypts").style.display = "none";
   document.getElementById("yourpts").style.display = "none";
   fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then(response => response.json())
      .then(data => deckId = data.deck_id);
};

function startGame() {
   document.getElementById("dealbutton").style.display = "none";
   document.getElementById("hitbutton").style.display = "inline";
   document.getElementById("standbutton").style.display = "inline";
   document.getElementById("enemypts").style.display = "inline";
   document.getElementById("yourpts").style.display = "inline";
   document.getElementById("message").innerHTML = "";
   points = 0;
   enemyPoints = 0;
   showCard = 0;
   playerCards = [];
   enemyCards = [];
   fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/shuffle/?deck_count=1")
      .then(response => response.json())
      .then(data => setup(data)); //setup with deck data
}

function setup(data) {
   console.log(data);
   fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=2")
      .then(response => response.json())
      .then(data1 => update(data1, 0)) //draw card from this deck
      .then(
         () => fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=2")
         .then(response => response.json())
         .then(data2 => update(data2, 1))
      ); //draw card from this deck
} //sets up new round

function hit(side) {
   fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
      .then(response => response.json())
      .then(data => update(data, side)); //draw card from this deck
} //draw 1 card

function update(data, side) {
   console.log(data);
   if (data != 0) {
      for (a = 0; a < data.cards.length; a += 1) {
         console.log(data.cards[a]);
         if (side == 0) {
            enemyCards.push(data.cards[a]); //add new card to enemy hand
            console.log(enemyCards);
         } else if (side == 1) {
            playerCards.push(data.cards[a]); //add new card to player hand
            console.log(playerCards);
         }
      }
   }
   //count enemy points
   enemyPoints = 0;
   totalAces = 0;
   document.getElementById("enemycards").innerHTML = "";
   for (a = 0; a < enemyCards.length; a += 1) {
      if (a == 1 && showCard == 0) {
         document.getElementById("enemycards").innerHTML += "<img src='https://deckofcardsapi.com/static/img/back.png' alt=''>";
      } else {
         document.getElementById("enemycards").innerHTML += "<img src='" + enemyCards[a].images.png + "' alt=''>";
      }
      if (enemyCards[a].value >= 2 && enemyCards[a].value <= 10) {
         enemyPoints += parseInt(enemyCards[a].value);
      } else if (enemyCards[a].value == "ACE") {
         totalAces += 1;
      } else {
         enemyPoints += 10;
      }
   } //count non ace cards and # of aces
   for (a = 0; a < totalAces; a += 1) {
      if (enemyPoints < 12 - totalAces) { // if theres multiple aces, it stops a bust by making aces equal to 1
         enemyPoints += 11;
      } else {
         enemyPoints += 1;
      }
   } //count aces
   if (showCard == 0) {
      x = 0;
      if (enemyCards[0].value >= 2 && enemyCards[0].value <= 10) {
         x = parseInt(enemyCards[0].value);
      } else if (enemyCards[0].value == "ACE") {
         x = 11;
      } else {
         x = 10;
      }
      document.getElementById("enemypts").innerHTML = "<span class='smalltext'>Dealer</span> " + x; //only show second card
   } else {
      document.getElementById("enemypts").innerHTML = "<span class='smalltext'>Dealer</span> " + enemyPoints; //show true 
   }
   console.log(enemyPoints);
   if (enemyPoints > 21) {
      endGame(1); //win
   } //bust

   //count player points
   points = 0;
   totalAces = 0;
   document.getElementById("yourcards").innerHTML = "";
   for (a = 0; a < playerCards.length; a += 1) {
      document.getElementById("yourcards").innerHTML += "<img src='" + playerCards[a].images.png + "' alt=''>";
      if (playerCards[a].value >= 2 && playerCards[a].value <= 10) {
         points += parseInt(playerCards[a].value);
      } else if (playerCards[a].value == "ACE") {
         totalAces += 1;
      } else {
         points += 10;
      }
   } //count non ace cards and # of aces
   for (a = 0; a < totalAces; a += 1) {
      if (points < 12 - totalAces) { // if theres multiple aces, it stops a bust by making aces equal to 1
         points += 11;
      } else {
         points += 1;
      }
   } //count aces
   document.getElementById("yourpts").innerHTML = "<span class='smalltext'>Player</span> " + points;
   console.log(points);
   if (points > 21) {
      endGame(0); //lose
   } //bust
}

function turnOver() {
   document.getElementById("hitbutton").style.display = "none";
   document.getElementById("standbutton").style.display = "none";
   showCard = 1;
   update(0, 0);
   setTimeout("autoHit(enemyPoints)", 500);
}

function autoHit(x) {
   if (x < 18) {
      fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
         .then(response => response.json())
         .then(data => update(data, 0)) //draw card from this deck
         .then(() => setTimeout("autoHit(enemyPoints)", 200)); //run itself again if still <18
   } else {
      console.log(enemyPoints);
      console.log(points);
      //compare points
      if (enemyPoints > 21) {
         endGame(1); //win
      } else if (points > 21) {
         endGame(0); //lose
      } else if (points > enemyPoints) {
         endGame(1); //win
      } else if (points < enemyPoints) {
         endGame(0); //lose
      } else {
         endGame(2); //tie
      }
   }
} // hit until over 18, then end game

function endGame(side) {
   if (side == 0) {
      document.getElementById("message").innerHTML = "YOU LOST";
   } else if (side == 1) {
      document.getElementById("message").innerHTML = "YOU WON";
   } else if (side == 2) {
      document.getElementById("message").innerHTML = "TIE";
   }
   document.getElementById("hitbutton").style.display = "none";
   document.getElementById("standbutton").style.display = "none";
   document.getElementById("dealbutton").style.display = "inline";
}
window.addEventListener('offline', () => {
   document.getElementById("message").innerHTML = "The game is offline and will not work";
});
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register('/sw.js');
}