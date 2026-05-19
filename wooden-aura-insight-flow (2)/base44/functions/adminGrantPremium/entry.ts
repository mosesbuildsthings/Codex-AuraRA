import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { email, role } = await req.json();
  if (!email || !role) {
    return Response.json({ error: 'email and role are required' }, { status: 400 });
  }

  // Find the user by email
  const users = await base44.asServiceRole.entities.User.filter({ email });
  if (!users || users.length === 0) {
    return Response.json({ error: `User not found: ${email}` }, { status: 404 });
  }

  const targetUser = users[0];
  await base44.asServiceRole.entities.User.update(targetUser.id, { role });

  return Response.json({ success: true, message: `User ${email} role updated to ${role}`, userId: targetUser.id });
});