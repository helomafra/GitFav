import { GithubUser } from "./githubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);

    this.tbody = this.root.querySelector("table tbody");

    this.load();
  }

  load() {
    //JSON.parse serve para modificar um json para o objeto q está dentro do json
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    //transforma o this.entries em uma string para depois salvar no localstorage
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
    this.noneFavorite();
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já cadastrado");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }

      //vai puxar o novo usuário pesquisado, e enviar os usuários ja existentes para baixo, em um novo array para manter a imutabilidade - nao posso usar um push!
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.update();
    this.onadd();
    this.noneFavorite();
  }

  onadd() {
    //serve para pegar o valor que está dentro do input
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");

      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOK = confirm("Tem certeza que deseja deletar essa linha?");
        if (isOK) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `   
    <td class="user">
      <img
        src="https://github.com/maykbrito.png"
        alt="Imagem e maykbritto"
      />
      <a href="https://github.com/maykbrito" target="_blank">
        <p>Mayk Brito</p>
        <span>/maykbrito</span>
        
      </a>
    </td>
    <td class="repositories">76</td>
    <td class="followers">9589</td>
    <td >
      <button class="remove">Remover</button>
    </td>
    `;

    return tr;
  }

  noneFavorite() {
    if (this.entries <= 0) {
      this.root.querySelector(".not-favorite").classList.remove("hide");
    } else {
      this.root.querySelector(".not-favorite").classList.add("hide");
    }
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
