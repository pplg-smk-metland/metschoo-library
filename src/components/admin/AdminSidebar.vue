<template>
  <nav class="sidebar">
    <div class="sidebar__header">
      <p>ceritanya nama admin</p>
    </div>

    <ul class="sidebar__list">
      <li>
        <a href="/admin">Dashboard</a>
        <ul class="sidebar__sub-list">
          <li><a href="#">Manajemen pengguna</a></li>
          <li><a href="#">peminjaman</a></li>
        </ul>
      </li>
      <li>
        <a href="#">Data buku</a>
        <ul class="sidebar__sub-list">
          <li><a href="#">Daftar buku</a></li>
          <li><a href="#">Tambah buku</a></li>
          <li><a href="#">apa kek</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<style>
.sidebar {
  background: var(--primary);
  color: var(--white);
  flex-basis: 25ch;

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
