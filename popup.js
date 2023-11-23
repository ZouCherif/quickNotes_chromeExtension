document.addEventListener("DOMContentLoaded", function () {
  const noteContent = document.getElementById("noteContent");
  const saveButton = document.getElementById("saveButton");
  const displayNoteButton = document.getElementById("displayNoteButton");

  displayNoteButton.addEventListener("click", function () {
    chrome.storage.local.get({ userNotes: [] }, function (result) {
      const notes = result.userNotes;

      const noteList = document.getElementById("noteList");
      noteList.innerHTML = "";

      notes.forEach(function (note, index) {
        const noteElement = document.createElement("div");
        noteElement.classList.add("list_item");
        noteElement.textContent = note;
        noteElement.addEventListener("click", function () {
          console.log(note);
          noteContent.value = note;
        });
        noteList.appendChild(noteElement);
      });
    });
  });

  saveButton.addEventListener("click", function () {
    const noteText = noteContent.value;

    chrome.storage.local.get({ userNotes: [] }, function (result) {
      const notes = result.userNotes;
      notes.push(noteText);
      noteContent.value = "";

      chrome.storage.local.set({ userNotes: notes }, function () {
        console.log("Nouvelle note enregistrée : " + noteText);
      });
    });
  });
});
