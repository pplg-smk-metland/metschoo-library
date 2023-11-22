<template>
  <nav class="sidebar">
    <div class="sidebar__header">
      <p>ceritanya nama admin</p>
    </div>

    <ul class="sidebar__list">
      <li>
        <routerLink :to="{ name: 'admin' }">Dashboard</routerLink>
        <ul class="sidebar__sub-list">
          <li><routerLink :to="{ name: 'manajemen-pengguna' }">Manajemen pengguna</routerLink></li>
          <li><routerLink :to="{ name: 'peminjaman' }">peminjaman</routerLink></li>
        </ul>
      </li>
      <li>
        <routerLink :to="{ name: 'data-buku' }">Data buku</routerLink>
        <ul class="sidebar__sub-list">
          <li><RouterLink :to="{ name: 'daftar-buku' }">Daftar buku</RouterLink></li>
          <li><routerLink :to="{ name: 'tambah-buku' }">Tambah buku</routerLink></li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<style>
.sidebar {
  background: var(--primary);
  color: var(--white);
  min-width: 25ch;

  display: flex;
  flex-direction: column;
}

.sidebar a {
  display: block;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar__header {
  padding: 1rem;
}

.sidebar__list a {
  padding: 1rem;
}

.sidebar a {
  color: inherit;
}

.sidebar__sub-list {
  background: var(--secondary-100);
}
</style>
