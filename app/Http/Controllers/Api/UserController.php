<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
   public function index()
    {
        // Return all users
        return response()->json(User::orderBy('name')->paginate(5));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:4',
        ]);

        // The User model automatically hashes passwords due to your $casts array!
        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:4',
        ]);

        // Only update password if a new one was typed in
        if (!empty($validated['password'])) {
            $validated['password'] = $validated['password'];
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        // Optional: Prevent user from deleting themselves
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }
}
