document.addEventListener("DOMContentLoaded", function () {
  const noteContent = document.getElementById("noteContent");
  const saveButton = document.getElementById("saveButton");
  const displayNoteButton = document.getElementById("displayNoteButton"); // Nouveau bouton pour afficher les notes

  // Charger et afficher la note lors du clic sur le bouton
  displayNoteButton.addEventListener("click", function () {
    // Récupérer la note du stockage local
    chrome.storage.local.get("userNote", function (result) {
      if (result.userNote) {
        noteContent.value = result.userNote; // Afficher la note dans le champ de texte
      } else {
        noteContent.value = "Aucune note enregistrée."; // Si aucune note n'est trouvée
      }
    });
  });

  // Enregistrer la note
  saveButton.addEventListener("click", function () {
    const noteText = noteContent.value;

    // Vous pouvez ajouter ici la logique pour sauvegarder la note
    // Par exemple, vous pouvez stocker la note dans le stockage local de l'extension

    // Exemple de stockage local
    chrome.storage.local.set({ userNote: noteText }, function () {
      console.log("Note enregistrée : " + noteText);
    });
  });
});
