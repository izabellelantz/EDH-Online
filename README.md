# EDH Online

**An unofficial fan content web game created by Izabelle Lantz**

![real edh main](https://github.com/user-attachments/assets/2ad07efe-7f00-4392-a6c9-d48a022652f1)

This project is created as a way for fans of Magic the Gathering to play EDH manually with friends without the hassle of finding *hours* to play in person.

## Current Status - 09/2024
**In Production**

This project is currently in the process of being finalized! Once it is deployed the link will be uploaded here!

## How It's Made
**Tech Used:** HTML, CSS, Vite, React-TS, Express, JavaScript, Socket.IO

This project's front end and gameplay were created using HTML, CSS, and Vite's React-TS package. 

The back-end authentication server was created using Express and MongoDB, to allow users to create accounts, log in, store decks, and find friends.

Socket.IO was implemented to allow for live user interaction through messaging and gameplay.

## Demo

https://github.com/user-attachments/assets/a68dbea6-a070-4f29-a7df-0990635862c7

## Features:
**User Accounts:** Users can create an account where their information, including their username, password, deck, friends list, and blocked list are all stored securely.

**Live Gameplay:** Users can play games with 2-6 players, with moves showing on all ends as soon as they are made. Certain things (such as lives) are available to be edited by any player, but most are only editable by the current player.

**Interactivity:** Players can add friends, remove friends, block users, invite others to games, and most importantly interact with their friends during games through messaging systems!

**Deck Storage:** User-uploaded decks are stored in their account and available for viewing, sorted by card type.

## How To Play
**1:** Create an account or log in!

**2:** Upload your deck. There are instructions on the upload page on how to get your deck in the proper format. If you do not already have a deck, there is a sample one included that may be used instead.

**3:** Add friends. Look them up by username and send a request! Once they accept your request, they will appear in your friends list where you may invite them to a game or join them through an invite.

**4:** If you'd like to skip the adding process, you can also create a new game by clicking start game, inventing a room code, and sharing it with your friends directly! Once they enter the room code on their side they will join you in the waiting room.

**5:** Once there are 2 or more people in the waiting room, you may begin the game whenever your group is ready.

**6:** Upon starting the game, you may draw your seven cards by clicking on your deck seven times.

**7:** After drawing your first hand, decide if you would like to mulligan (place them back into your deck on the bottom and draw a new hand). If you choose to mulligan, make sure to only draw six or discard one if you draw seven.

**8:** Now gameplay begins as normal! Use the phase tracker in the upper left-hand side of your board to remind yourself and your opponents of what phase you are currently in.

**9:** Play one land per turn, use your mana pool to keep track of your mana available for convenience, update your creatures by adding counters or moving board states, and keep track of your lives and the lives of opponents.

Any updates or moves your opponents make will be shown to both of you. Use the chat to discuss other choices and abilities -- for example: choosing a creature type for Cavern of Souls.
