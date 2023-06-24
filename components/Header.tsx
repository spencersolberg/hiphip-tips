interface HeaderProps {
  subdomain?: string;
}

export default function Header(props: HeaderProps) {
  const { subdomain } = props;
  return (<>
    <div class="lg:flex justify-between w-full mx-auto p-4 text-white hidden">
      <a href="/about" class="text-2xl w-2/5 hover:italic hover:underline"><p>about</p></a>
      <a href="/" class="text-5xl mx-auto w-1/5 text-center">hiphiptips</a>
      {subdomain
        ? <a href="/subdomain" class="text-2xl truncate w-2/5 text-right hover:italic hover:underline"><p>{subdomain}.hiphiptips</p></a>
        : <a href="/login" class="text-2xl text-right w-2/5 hover:italic hover:underline"><p>login</p></a>
      }
    </div>
    <div class="lg:hidden flex flex-col justify-between w-full mx-auto p-4 text-white -mb-8">
      <a href="/" class="text-5xl mx-auto text-center">hiphiptips</a>
      {subdomain
          ? <a href="/subdomain" class="text-2xl mt-4 truncate text-center mx-auto hover:italic hover:underline"><p>{subdomain}.hiphiptips</p></a>
          : <a href="/login" class="text-2xl mt-4 text-center mx-auto  hover:italic hover:underline"><p>login</p></a>
        }
      <a href="/about" class="text-2xl mt-2 text-center mx-auto hover:italic hover:underline"><p>about</p></a>
    </div>
  </>)
}