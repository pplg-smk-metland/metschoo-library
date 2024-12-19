<template>
  <header class="flex flex-wrap justify-between gap-8">
    <div class="basis-80 flex-grow">
      <h1>
        <slot name="header-heading"> Metschoo Library </slot>
      </h1>
      <p>
        <slot name="header-text"> Selamat datang di Metschoo Library! </slot>
      </p>
    </div>

    <div class="flex-grow">
      <SearchBar />
    </div>
  </header>
</template>
