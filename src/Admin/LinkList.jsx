import { useEffect, useState } from "react";

export default function LinkList() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch("http://47.238.3.148/backend-api/links")
      .then(res => res.json())
      .then(data => {
        if (data.success) setLinks(data.links);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-md mx-auto mt-4">
      <h2 className="text-xl font-bold mb-2">ลิงก์ทั้งหมด</h2>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link._id} className="border p-2 rounded">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {link.url}
            </a>
            {link.description && <p className="text-gray-600">{link.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
