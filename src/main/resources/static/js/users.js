(() => {
    const $ = (sel) => document.querySelector(sel);
    const tbody = $("#users-tbody");
    const alertBox = $("#alert-container");
    const modalEl = $("#userModal");
    const modal = new bootstrap.Modal(modalEl);

    const field = {
        id: $("#user-id"),
        email: $("#email"),
        firstName: $("#firstName"),
        lastName: $("#lastName"),
        age: $("#age"),
        password: $("#password"),
        roles: $("#roles"),
    };

    const errs = {
        email: $("#err-email"),
        firstName: $("#err-firstName"),
        lastName: $("#err-lastName"),
        age: $("#err-age"),
        password: $("#err-password"),
        roles: $("#err-roles"),
    };

    const API = {
        users: "/api/users",
        roles: "/api/roles"
    };

    function flash(type, text) {
        const node = document.createElement("div");
        node.className = `alert alert-${type} alert-dismissible fade show`;
        node.innerHTML = `${text}<button class="btn-close" data-bs-dismiss="alert"></button>`;
        alertBox.append(node);
        setTimeout(() => bootstrap.Alert.getOrCreateInstance(node).close(), 3500);
    }

    function roleBadge(name) {
        const label = name.replace("ROLE_", "");
        return `<span class="badge rounded-pill text-bg-secondary me-1">${label}</span>`;
    }

    function tr(u) {
        return `
      <tr data-id="${u.id}">
        <td>${u.id}</td>
        <td class="fw-semibold">${u.email}</td>
        <td>${u.firstName}</td>
        <td>${u.lastName}</td>
        <td>${u.age}</td>
        <td>${(u.roles||[]).map(roleBadge).join("")}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1 btn-edit"><i class="bi bi-pencil-square"></i> Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete"><i class="bi bi-trash"></i> Delete</button>
        </td>
      </tr>`;
    }

    async function loadRoles() {
        const res = await fetch(API.roles);
        if (!res.ok) throw new Error("Failed to load roles");
        const roles = await res.json();
        field.roles.innerHTML = roles.map(r => `<option value="${r.name}">${r.name.replace("ROLE_","")}</option>`).join("");
    }

    async function loadUsers() {
        const res = await fetch(API.users);
        if (!res.ok) throw new Error("Failed to load users");
        const list = await res.json();
        tbody.innerHTML = list.map(tr).join("");
    }

    function clearErrors() {
        Object.values(errs).forEach(e => { e.textContent=""; e.style.display="none"; });
        Object.values(field).forEach(f => f && f.classList && f.classList.remove("is-invalid"));
    }

    function setErrors(fields) {
        if (!fields) return;
        Object.entries(fields).forEach(([k, v]) => {
            if (errs[k]) {
                errs[k].textContent = v;
                errs[k].style.display = "block";
            }
            if (field[k]) field[k].classList.add("is-invalid");
        });
    }

    function openCreate() {
        clearErrors();
        $("#modal-title").textContent = "Create User";
        field.id.value = "";
        field.email.value = "";
        field.firstName.value = "";
        field.lastName.value = "";
        field.age.value = 0;
        field.password.value = "";
        [...field.roles.options].forEach(o => o.selected = false);
        modal.show();
    }

    async function openEdit(id) {
        clearErrors();
        const res = await fetch(`${API.users}/${id}`);
        if (!res.ok) { flash("danger", "Failed to load user"); return; }
        const u = await res.json();
        $("#modal-title").textContent = `Edit User #${u.id}`;
        field.id.value = u.id;
        field.email.value = u.email;
        field.firstName.value = u.firstName;
        field.lastName.value = u.lastName;
        field.age.value = u.age;
        field.password.value = "";
        [...field.roles.options].forEach(o => o.selected = (u.roles||[]).includes(o.value));
        modal.show();
    }

    async function save(e) {
        e.preventDefault();
        clearErrors();

        const id = field.id.value.trim();
        const method = id ? "PUT" : "POST";
        const url = id ? `${API.users}/${id}` : API.users;

        const selectedRoles = [...field.roles.options].filter(o => o.selected).map(o => o.value);

        const body = {
            email: field.email.value.trim(),
            firstName: field.firstName.value.trim(),
            lastName: field.lastName.value.trim(),
            age: Number(field.age.value),
            password: field.password.value,
            roles: selectedRoles
        };

        if (!id && !body.password) {
            setErrors({ password: "Password is required" });
            return;
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            modal.hide();
            await loadUsers();
            flash("success", id ? "User updated" : "User created");
        } else {
            const data = await res.json().catch(()=>({message:"Error"}));
            setErrors(data.fields);
            if (data.message) flash("danger", data.message);
        }
    }

    async function del(id) {
        if (!confirm("Delete this user?")) return;
        const res = await fetch(`${API.users}/${id}`, { method: "DELETE" });
        if (res.ok) {
            await loadUsers();
            flash("success", "User deleted");
        } else {
            flash("danger", "Failed to delete");
        }
    }

    $("#btn-open-create").addEventListener("click", openCreate);
    $("#user-form").addEventListener("submit", save);
    $("#users-tbody").addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr) return;
        const id = tr.getAttribute("data-id");
        if (e.target.closest(".btn-edit")) openEdit(id);
        if (e.target.closest(".btn-delete")) del(id);
    });

    (async () => {
        try {
            await loadRoles();
            await loadUsers();
        } catch (e) {
            flash("danger", e.message || "Failed to initialize");
        }
    })();

})();