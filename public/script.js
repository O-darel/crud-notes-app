const notesContainer = document.getElementById('notes-container');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');

// Fetch and display notes
async function fetchNotes() {
    const response = await fetch('/api/notes');
    const notes = await response.json();
    //console.log(notes)

    //map notes
    notesContainer.innerHTML = notes
        .map(
            (note) => `
        <div class="border p-4 mb-2">
            <h2 class="font-bold">${note.title}</h2>
            <p>${note.content}</p>
            <button class="bg-red-500 text-white p-2 mt-2" onclick="deleteNote('${note._id}')">Delete</button>
        </div>
    `
        )
        .join('');
}

// Add a new note
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    //takes form data
    const title = titleInput.value;
    const content = contentInput.value;

    //post notes data
    await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
    });

    //reset inputs
    titleInput.value = '';
    contentInput.value = '';

    //refetch notes data
    fetchNotes();
});

// Delete a note
async function deleteNote(id) {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    fetchNotes();
}

// Initialize
fetchNotes();
