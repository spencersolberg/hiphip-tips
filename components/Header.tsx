interface HeaderProps {
  subdomain?: string;
}

export default function Header(props: HeaderProps) {
  const { subdomain } = props;
  return (
<div class="flex justify-between w-full mx-auto p-4 text-white">
  <a href="/about" class="text-2xl w-1/4 hover:italic hover:underline"><p>about</p></a>
  <a href="/" class="text-5xl mx-auto w-1/2 text-center">hiphiptips</a>
  {subdomain
    ? <a href="/subdomain" class="text-2xl truncate w-1/4 text-right hover:italic hover:underline"><p>{subdomain}.hiphiptips</p></a>
    : <a href="/login" class="text-2xl text-right w-1/4 hover:italic hover:underline"><p>login</p></a>
  }
</div>
  )
}