export default function Footer() {
  return (
    <div class="flex justify-between items-center mt-auto w-full px-4 pt-8 text-white">
      <div class="flex-col flex lg:flex-row">
        <a class="lg:pr-4 underline hover:italic" href="/">
          <p>home</p>
        </a>
        <a class="lg:px-4 underline hover:italic" href="/about">
          <p>about</p>
        </a>
        <a class="lg:px-4 underline hover:italic" href="/api">
          <p>api</p>
        </a>
        <a class="lg:px-4 underline hover:italic" href="/account">
          <p>account</p>
        </a>
      </div>
      <div class="flex flex-col lg:flex-row text-right lg:text-left">
        <p class="lg:hidden text-black select-none">nothing</p>
        <p class="">
          © {new Date().getFullYear()} <span class="hidden lg:inline  ">|</span>{" "}
        </p>
        <p>
          <a class="underline hover:italic lg:px-4" href="https://spencersolberg/" target="_blank" rel="noreferrer">
            spencersolberg/
          </a>
        </p>
        <p>
          <a class="underline hover:italic" href="https://spencersolberg.com" target="_blank" rel="noreferrer">
            spencersolberg.com
          </a>
        </p>
      </div>
    </div>
  );
}
