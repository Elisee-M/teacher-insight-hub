import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';

export default function Settings() {
  const { isAdmin, loading, users, addUser, updateUser, deleteUser } = useAdmin();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [newUser, setNewUser] = useState({ name: '', role: 'user' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAddUser = async () => {
    if (!newUser.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a name',
      });
      return;
    }

    try {
      await addUser(newUser.name, newUser.role);
      toast({
        title: 'Success',
        description: 'User added successfully',
      });
      setNewUser({ name: '', role: 'user' });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add user',
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, editingUser.name, editingUser.role);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete user',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Admin Settings</CardTitle>
            </div>
            <CardDescription>Manage system users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Add a new user to the system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Name</Label>
                      <Input
                        id="userName"
                        placeholder="Enter user name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUser}>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((appUser) => (
                  <TableRow key={appUser.id}>
                    <TableCell className="font-mono text-xs">{appUser.id}</TableCell>
                    <TableCell>{appUser.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${appUser.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {appUser.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingUser(appUser);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {appUser.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(appUser.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>Update user information</DialogDescription>
                </DialogHeader>
                {editingUser && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <Input value={editingUser.id} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editName">Name</Label>
                      <Input
                        id="editName"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editRole">Role</Label>
                      <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditUser}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
