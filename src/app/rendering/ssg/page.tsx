export default async function SSGPage() {
  const res = await fetch('https://dog.ceo/api/breeds/image/random', {cache: 'force-cache'});
  const resJson = await res.json();
  const image = resJson.message;
  const timestamp = new Date().toISOString();
  return (
    <div>
      SSR 毎回リロード:{timestamp}
      <img src={image} width={400} />
    </div>
  );
}