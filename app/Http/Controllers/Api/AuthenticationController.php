<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helpers;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\ForgotPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthenticationController extends Controller
{
    public function create(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email:rfc,dns|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ]);

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        // NewUserSignUpEvent::dispatch($user);
        return response()->json([
            'message' => 'Account created successfully',
            'access_token' => $user->createToken('login')->plainTextToken,
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::findByEmail($data['email']);

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // $user->last_login_ip = $request->ip();
        // $user->last_login_mac = exec('getmac');
        // $user->last_login_at = now();
        // $user->save();

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $user->createToken('login')->plainTextToken,
        ]);
    }

    public function userProfile(Request $request)
    {
        // return new UserResource(Auth::user());
        return response()->json($request->user());
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'oldPassword' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($data['oldPassword'], $user->password)) {
            return response()->json(['message' => 'incorrect password'], 401);
        }

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::findByEmail($data['email']);

        if ($user) {
            $code = Helpers::generateRandomCode();
            Cache::add(
                'password_reset_code.user.' . md5($user->id),
                Hash::make($code),
                now()->addMinutes(10),
            );

            $user->notify(new ForgotPassword($code));
        }

        return response()->json(['message' => 'Password reset code sent']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'passwordResetCode' => 'required|numeric',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::findByEmail($data['email']);
        $code = Cache::get('password_reset_code.user.' . md5($user->id));

        if (!$code || !Hash::check($data['passwordResetCode'], $code)) {
            return response()->json(['message' => 'Incorrect or Expired reset code'], 401);
        }

        $user->password = Hash::make($data['password']);
        $user->save();
        $user->tokens()->delete();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response()->json(['status' => 'success', 'message' => 'signed out successfully']);
    }
}
