<template>
  <header class="flex flex-wrap justify-between">
    <div class="flex-1">
      <h1>
        <slot name="header-heading"> Metschoo Library </slot>
      </h1>
      <p>
        <slot name="header-text"> Selamat datang di Metschoo Library! </slot>
      </p>
    </div>

    <div class="flex-1">
      <SearchBar />
    </div>
  </header>
</template>
