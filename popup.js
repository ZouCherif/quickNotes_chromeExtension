document.addEventListener("DOMContentLoaded", function () {
  const noteContent = document.getElementById("noteContent");
  const saveButton = document.getElementById("saveButton");
  const displayNoteButton = document.getElementById("displayNoteButton");
  const deleteNoteButton = document.getElementById("deleteNote");
  const modifyNoteButton = document.getElementById("modifyNote");
  const returnButton = document.getElementById("returnButton");
  const noteList = document.getElementById("noteList");
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

      chrome.storage.local.get({ userNotes: [] }, function (result) {
        const notes = result.userNotes;

        notes[currentNote].content = noteText;
        notes[currentNote].timestamp = new Date().getTime();

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
      chrome.storage.local.get({ userNotes: [] }, function (result) {
        const notes = result.userNotes;
        const newIndex = notes.length; // Indice pour la nouvelle note

        const newNote = {
          index: newIndex,
          content: noteText,
          timestamp: currentTime.getTime(),
        };

        notes.push(newNote);
        noteContent.value = "";

        chrome.storage.local.set({ userNotes: notes }, function () {
          console.log("Nouvelle note enregistrée : " + noteText);
        });
      });
    }
  });
});
