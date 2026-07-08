
'use client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UserListPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch(`http://localhost:4000/user`).then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User List</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>id</TableHead>
            <TableHead>email</TableHead>
            <TableHead>password</TableHead>
            <TableHead>name</TableHead>
            <TableHead>role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.password}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
      