<template>
  <header>
    <div class="header__text">
      <h1>
        <slot name="header-heading"> Metschoo Library </slot>
      </h1>
      <p>
        <slot name="header-text"> Selamat datang di Metschoo Library! </slot>
      </p>
    </div>

    <div class="header__search-bar">
      <SearchBar />
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  flex-wrap: wrap;
}

header > * {
  flex-grow: 1;
}
</style>
