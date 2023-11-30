document.addEventListener("DOMContentLoaded", function () {
  const noteContent = document.getElementById("noteContent");
  const saveButton = document.getElementById("saveButton");
  const displayNoteButton = document.getElementById("displayNoteButton");
  const deleteNoteButton = document.getElementById("deleteNote");
  const modifyNoteButton = document.getElementById("modifyNote");
  const returnButton = document.getElementById("returnButton");
  const noteList = document.getElementById("noteList");
  const alarm = document.getElementById("rappel");
  const timeInput = document.getElementById("timeInput");
  // chrome.storage.local.remove("userNotes", function () {
  //   console.log("Toutes les notes ont été supprimées du stockage local.");
  // });
  var currentNote = -1;

  displayNoteButton.addEventListener("click", function () {
    chrome.storage.local.get({ userNotes: [] }, function (result) {
      const notes = result.userNotes;

      const noteList = document.getElementById("noteList");
      noteList.innerHTML = "";

      notes.forEach(function (note, index) {
        const noteElement = document.createElement("div");
        noteElement.classList.add("list_item");

        const noteContentDiv = document.createElement("div");
        noteContentDiv.classList.add("note_content");
        noteContentDiv.textContent = note.content; // Contenu de la note

        const timestampDiv = document.createElement("div");
        timestampDiv.classList.add("timestamp");

        const timestamp = new Date(note.timestamp);
        const hours = timestamp.getHours().toString().padStart(2, "0");
        const minutes = timestamp.getMinutes().toString().padStart(2, "0");
        const formattedTime = `${hours}:${minutes}`;
        timestampDiv.textContent = formattedTime; // Temps de la note

        noteElement.appendChild(noteContentDiv);
        noteElement.appendChild(timestampDiv);

        noteElement.addEventListener("click", function () {
          noteContent.value = note.content;
          currentNote = index;
          deleteNoteButton.style.display = "block";
          modifyNoteButton.style.display = "block";
          returnButton.style.display = "block";
          saveButton.style.display = "none";
          displayNoteButton.style.display = "none";
          noteList.style.display = "none";
        });
        noteList.appendChild(noteElement);
      });
    });
  });

  returnButton.addEventListener("click", function () {
    noteContent.value = "";
    currentNote = -1;
    timeInput.value = "";
    alarm.checked = false;
    timeInput.style.display = "none";
    deleteNoteButton.style.display = "none";
    modifyNoteButton.style.display = "none";
    saveButton.style.display = "block";
    displayNoteButton.style.display = "block";
    noteList.style.display = "block";
    returnButton.style.display = "none";
  });

  modifyNoteButton.addEventListener("click", function () {
    if (currentNote !== -1) {
      const noteText = noteContent.value;
      let reminderTime = null; // Initialisez le rappel à null par défaut

      if (alarm.checked) {
        const selectedTime = new Date(timeInput.value); // Obtenez la date et l'heure spécifiées par l'utilisateur
        const currentTime = new Date();

        if (selectedTime > currentTime) {
          // Vérifiez si le temps sélectionné est dans le futur
          reminderTime = selectedTime.getTime(); // Convertissez la date en millisecondes
        } else {
          // Gérez l'erreur si la date est antérieure à la date actuelle
          console.log("Veuillez sélectionner une heure future pour l'alarme.");
          return; // Arrêtez le processus de modification
        }
      }

      chrome.storage.local.get({ userNotes: [] }, function (result) {
        const notes = result.userNotes;

        notes[currentNote].content = noteText;
        notes[currentNote].timestamp = new Date().getTime();
        notes[currentNote].reminder = reminderTime; // Mettez à jour le rappel dans la note

        chrome.storage.local.set({ userNotes: notes }, function () {
          console.log("Note modifiée : " + noteText);
          returnButton.click();
          displayNoteButton.click();
        });
      });
    }
  });

  deleteNoteButton.addEventListener("click", function () {
    if (currentNote !== -1) {
      chrome.storage.local.get({ userNotes: [] }, function (result) {
        const notes = result.userNotes;

        notes.splice(currentNote, 1); // Supprimer la note sélectionnée du tableau

        chrome.storage.local.set({ userNotes: notes }, function () {
          console.log("Note supprimée");
          returnButton.click();
          displayNoteButton.click(); // Revenir à la liste des notes après suppression
        });
      });
    }
  });

  saveButton.addEventListener("click", function () {
    if (noteContent.value != "") {
      const noteText = noteContent.value;
      const currentTime = new Date();
      let reminderTime = null; // Initialisez le rappel à null par défaut

      if (alarm.checked) {
        // Vérifiez si l'alarme est activée
        const selectedTime = new Date(timeInput.value); // Obtenez la date et l'heure spécifiées par l'utilisateur
        if (selectedTime > currentTime) {
          // Vérifiez si le temps sélectionné est dans le futur
          reminderTime = selectedTime.getTime(); // Convertissez la date en millisecondes
        } else {
          // Gérez l'erreur si la date est antérieure à la date actuelle
          console.log("Veuillez sélectionner une heure future pour l'alarme.");
          return; // Arrêtez le processus de sauvegarde
        }
      }

      chrome.storage.local.get({ userNotes: [] }, function (result) {
        const notes = result.userNotes;
        const newIndex = notes.length; // Indice pour la nouvelle note

        const newNote = {
          index: newIndex,
          content: noteText,
          timestamp: currentTime.getTime(),
          reminder: reminderTime, // Enregistrez le rappel dans la note
        };

        notes.push(newNote);
        noteContent.value = "";
        timeInput.value = "";
        alarm.checked = false;
        timeInput.style.display = "none";

        chrome.storage.local.set({ userNotes: notes }, function () {
          console.log("Nouvelle note enregistrée : " + noteText);
        });
      });
    }
  });

  alarm.addEventListener("change", function () {
    if (alarm.checked) {
      timeInput.style.display = "block";
    } else {
      timeInput.style.display = "none";
    }
  });

  // Méthode pour calculer la différence de temps
  function calculateTimeDifference(reminderTime) {
    const currentTime = new Date().getTime();
    const reminderDateTime = new Date(reminderTime).getTime();
    return reminderDateTime - currentTime;
  }

  function displayNotification(noteContent) {
    const options = {
      type: "basic",
      title: "Rappel pour une note",
      message: `Vous avez un rappel pour : ${noteContent}`,
      iconUrl: "notif.png", // Remplacez par l'URL de votre icône
      priority: 2,
    };

    chrome.notifications.create(options, function (notificationId) {
      // Callback appelée après la création de la notification
      console.log("Notification affichée avec l'ID : " + notificationId);
      const audioElement = document.getElementById("notificationSound");
      audioElement.play();
    });
  }

  // Vérifier les rappels à intervalles réguliers
  setInterval(() => {
    chrome.storage.local.get({ userNotes: [] }, function (result) {
      const notes = result.userNotes;

      notes.forEach(function (note) {
        if (note.reminder) {
          const timeDifference = calculateTimeDifference(note.reminder);
          if (timeDifference <= 0) {
            displayNotification(note.content); // Afficher la notification
            note.reminder = null; // Supprimer le rappel
            // Enregistrer la note mise à jour dans le stockage
            chrome.storage.local.set({ userNotes: notes }, function () {
              console.log("Rappel supprimé pour la note : " + note.content);
            });
          }
        }
      });
    });
  }, 40000);
});
