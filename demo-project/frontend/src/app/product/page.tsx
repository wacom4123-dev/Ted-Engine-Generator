
'use client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProductListPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch(`http://localhost:4000/product`).then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Product List</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>id</TableHead>
            <TableHead>name</TableHead>
            <TableHead>price</TableHead>
            <TableHead>description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>{item.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
      