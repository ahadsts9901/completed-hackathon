const firebaseConfig = {
    apiKey: "AIzaSyCmKb5TcZ1TLrH3NbC3ADHHgQG6u9TXwVc",
    authDomain: "practice-4cdb5.firebaseapp.com",
    projectId: "practice-4cdb5",
    storageBucket: "practice-4cdb5.appspot.com",
    messagingSenderId: "566308702301",
    appId: "1:566308702301:web:f8ed2b146cc7e5faffe5b4",
    measurementId: "G-W7ERKEX4FB"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

let username = "";

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        username = user.email.slice(0, -10); // Store the username
    } else {
        window.location.href = "login.html";
    }
});

function textAreaSize() {
    var textArea = document.querySelector(".post");
    textArea.style.height = "auto"; // Reset the height to auto to recalculate the size

    // Calculate the maximum height for 5 lines
    var maxHeight = parseInt(window.getComputedStyle(textArea).lineHeight) * 16;

    // Set the height to the scrollHeight, but not exceeding the maximum height
    textArea.style.height = Math.min(textArea.scrollHeight, maxHeight) + "px";
}

function createPost(event) {
    event.preventDefault();

    let title = document.getElementById("title");
    let post = document.getElementById("post");
    let auth = firebase.auth();
    let user = auth.currentUser;
    let userEmail = user.email;
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    db.collection("posts")
        .add({
            title: title.value,
            post: post.value,
            user: userEmail,
            timestamp: timestamp,
        })
        .then((docRef) => {
            Swal.fire({
                icon: "success",
                title: "Added",
                text: "Post Done",
                confirmButtonColor: "#8540f5",
                showConfirmButton: false,
                timer: 1500,
            });
            window.location.reload()
        })
        .catch((error) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could Not Post",
                confirmButtonColor: "#8540f5",
                showConfirmButton: false,
                timer: 1500,
            });
        });
    title.value = "";
    post.value = "";
}

function renderPostsUser() {
    let container = document.querySelector(".resultDash");
    container.innerHTML = "";
    db.collection("posts")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerHTML = "<h1 class='font'>No Posts Found</h1>";
            } else {
                querySnapshot.forEach(function(doc) {
                    var data = doc.data();

                    if (username === data.user.slice(0, -10)) {
                        var timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
                        let post = document.createElement("div");
                        post.className += " column renderPost";

                        let row = document.createElement("div");
                        row.className += " row";
                        post.appendChild(row);

                        let image = document.createElement("img");
                        image.className += "userImg"
                        image.src = "https://avatars.githubusercontent.com/u/120649081?v=4"
                        row.appendChild(image);

                        let div = document.createElement("div")
                        div.className += " col"
                        div.style.marginLeft = "1em"
                        row.appendChild(div);

                        let title = document.createElement("p");
                        title.className += " title";
                        title.style.fontSize = "1.5em";
                        title.style.fontWeight = "bold";
                        title.innerText = data.title; // Render the title
                        div.appendChild(title);

                        let text = document.createElement("p");
                        text.className += " text";
                        text.style.fontSize = "1em"
                        text.style.fontWeight = "bolder"
                        text.innerText = data.post;
                        post.appendChild(text);

                        let tim = document.createElement("div")
                        tim.className += " row gap"
                        tim.style.gap = "0em"
                        div.appendChild(tim)

                        let name = document.createElement("p");

                        firebase.auth().onAuthStateChanged(function(user) {
                            if (user) {
                                username = user.email;

                                {
                                    db.collection("users")
                                        .get()
                                        .then((querySnapshot) => {
                                            {
                                                querySnapshot.forEach(function(doc) {
                                                    var data = doc.data();

                                                    if (data.email === username) {
                                                        console.log("founded")
                                                        name.innerText = `${data.firstName}  ${data.lastName} |`;
                                                        document.getElementById("headerName").innerText = `${data.firstName}  ${data.lastName}`;
                                                    }

                                                })
                                            }
                                        })
                                        .catch((error) => {
                                            console.error("Error getting posts: ", error);
                                        });
                                }

                            } else {
                                window.location.href = "./login.html";
                            }
                        });

                        tim.appendChild(name);

                        let time = document.createElement("p");
                        time.className += " postTime";
                        time.innerText = `| ${moment(timestamp).format("ll")}`;
                        tim.appendChild(time);

                        let cont = document.createElement("div");
                        cont.className += " row";
                        cont.style.gap = "1em"
                        cont.style.padding = "0.5em"

                        let del = document.createElement('p')
                        del.className += 'del'
                        del.innerText = 'Delete'
                        del.addEventListener("click", function() {
                            post.dataset.id = doc.id;
                            // console.log(doc.id);
                            delPost(doc.id);
                        });
                        cont.appendChild(del)

                        let edit = document.createElement('p')
                        edit.className += 'del'
                        edit.innerText = 'Edit'
                        edit.addEventListener("click", function() {
                            post.dataset.id = doc.id;
                            // console.log(doc.id);
                            editPost(doc.id, data.title, data.post);
                        });
                        cont.appendChild(edit)

                        post.appendChild(cont);

                        container.appendChild(post);
                    }

                });
            }
        })
        .catch((error) => {
            //console.error("Error getting posts: ", error);
        });
}

function delPost(postId) {
    // Show a confirmation popup using SweetAlert
    Swal.fire({
        title: "Delete Post",
        text: "Are you sure you want to delete this post?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#8540f5",
        cancelButtonColor: "#8540f5",
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("posts").doc(postId).delete()
                .then(() => {
                    Swal.fire({
                        icon: "success",
                        title: "Deleted",
                        text: "Post has been deleted.",
                        confirmButtonColor: "##8540f5",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    renderPostsUser();

                    window.location.reload()
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "An error occurred while deleting the post.",
                        confirmButtonColor: "#8540f5",
                    });
                });
        }
    });
}

function editPost(postId, previousTitle, previousPost) {
    // Show a prompt using SweetAlert for editing
    Swal.fire({
        title: "Edit Post",
        html: `<input id="editedTitle" class="swal2-input" value="${previousTitle}" placeholder="Title...">
             <textarea id="editedPost" class="swal2-input swal-ta" placeholder="Text...">${previousPost}</textarea>`,
        showCancelButton: true,
        confirmButtonColor: "#8540f5",
        cancelButtonColor: "#8540f5",
        confirmButtonText: "Save",
        preConfirm: () => {
            const editedTitle = document.getElementById('editedTitle').value;
            const editedPost = document.getElementById('editedPost').value;

            if (!editedTitle.trim() || !editedPost.trim()) {
                Swal.showValidationMessage('Both fields are required');
            }

            return { editedTitle, editedPost };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            const { editedTitle, editedPost } = result.value;
            db.collection("posts").doc(postId).update({
                    title: editedTitle,
                    post: editedPost,
                })
                .then(() => {
                    Swal.fire({
                        icon: "success",
                        title: "Updated",
                        text: "Post has been updated.",
                        confirmButtonColor: "#8540f5",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    renderPostsUser();
                    window.location.reload()
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "An error occurred while updating the post.",
                        confirmButtonColor: "#8540f5",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                });
        }
    });
}

function logOut() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            // console.log("Sign out successful");//

            window.location.href = "./login.html";
        })
        .catch((error) => {
            console.log("Sign out error:", error);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    renderPostsUser();
});