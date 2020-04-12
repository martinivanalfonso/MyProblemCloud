// Problem Class: Represents a Logic Problem
class Problem {
  constructor(detail, solution, date) {
    this.detail = detail;
    this.solution = solution;
    this.date = date;
  }
}

// UI Class: Handle UI Tasks
class UI {
  static async displayProblems() {
    const storedProblems = await Store.getProblems();
    storedProblems.forEach((problem) => UI.addProblemToList(problem.val()));
  }
  static addProblemToList(problem) {
    const list = document.getElementById("problem-list");

    const row = document.createElement("tr");
    // Adjusts display of solution in the table
    let solutionHeight = problem.solution.length > 200 ? "250px" : "auto";
    let detailHeight = problem.detail.length > 200 ? "250px" : "auto";

    row.innerHTML = `
        <td><textarea readonly="on" style="height:${detailHeight}">${problem.detail}</textarea></td>
        <td><textarea readonly="on" style="height:${solutionHeight}">${problem.solution}</textarea></td>
        <td>${problem.date}</td>
        <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
        `;
    list.appendChild(row);
  }

  static showAlert(message, className) {
    const div = document.createElement("div");
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector(".container");
    const form = document.querySelector("#problem-form");
    container.insertBefore(div, form);
    setTimeout(() => document.querySelector(".alert").remove(), 3000);
  }

  static clearFields() {
    document.getElementById("detail").value = "";
    document.getElementById("solution").value = "";
    document.getElementById("date").value = "";
  }

  static deleteProblem(elem) {
    elem.parentElement.parentElement.remove();
  }
}

// Store Class: Handles storage

class Store {
  static getProblems() {
    return firebase
      .database()
      .ref()
      .once("value")
      .then((data) => data);
  }
  static addProblemToDb(problem) {
    firebase.database().ref().push().set(problem);
  }
  static deleteProblem(target) {
    const id = target.parentElement.previousElementSibling.innerHTML;
    const problems = Store.getProblems();

    problems.then((problems) => {
      problems.forEach((problem) => {
        if (problem.val().date === id) {
          firebase.database().ref(problem.key).remove();
        }
      });
    });
  }
}

// Detects Device Type

const detectIfMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
    ? true
    : false;

if (detectIfMobile())
  UI.showAlert(
    "Sorry this website is not completely mobile friendly",
    "danger"
  );

// Event: Grows active form input
document.querySelector("#detail").addEventListener("focus", (e) => {
  console.log(e.target);
  e.target.setAttribute("rows", "10");
});
document.querySelector("#solution").addEventListener("focus", (e) => {
  console.log(e.target);
  e.target.setAttribute("rows", "10");
});

document.querySelector("#detail").addEventListener("blur", (e) => {
  console.log(e.target);
  e.target.setAttribute("rows", "1");
});
document.querySelector("#solution").addEventListener("blur", (e) => {
  console.log(e.target);
  e.target.setAttribute("rows", "1");
});

// Event: Display Problems()
document.addEventListener("DOMContentLoaded", UI.displayProblems);

// Event: Add a Problem
document.querySelector("#problem-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const detail = document.querySelector("#detail").value;
  const solution = document.querySelector("#solution").value;
  const date = document.querySelector("#date").value;

  if (detail === "" || solution === "" || date === "") {
    UI.showAlert("Please fill in all fields", "danger");
  } else {
    //Instatiate the Problem
    const problem = new Problem(detail, solution, date);

    UI.addProblemToList(problem);
    Store.addProblemToDb(problem);
    UI.showAlert("Problem added", "success");
    UI.clearFields();
  }
});

// Event: Remove a problem

document.querySelector("#problem-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    UI.deleteProblem(e.target);
    Store.deleteProblem(e.target);
    UI.showAlert("Problem removed", "success");
  }
});
