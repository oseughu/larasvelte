<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LinkController extends Controller
{
    /**
     * Display the Links view.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Links', [
            'links' => Link::where('user_id', \Auth::id())->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Put the user id in the request
        $request->merge(['user_id' => \Auth::id()]);

        $validated = $request->validate([
            'url' => 'required',
            'title' => 'required',
            'user_id' => 'required',
        ]);

        $validated['url'] = 'https://' . $validated['url'];

        Link::create($validated);

        return redirect()->route('links.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(Link $link)
    {
        // delete the link
        $link->delete();

        return redirect()->route('links.index');
    }
}
