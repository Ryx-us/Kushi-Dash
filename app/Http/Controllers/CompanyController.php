<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CompanyInfoController extends Controller
{
    public function index()
    {
        $companyName = env('COMPANY_NAME', null);

        if (is_null($companyName)) {
            Log::debug('COMPANY_NAME environment variable is not set or could not be read.');
            $companyName = 'Somthing stupid asf';
        }

        return [
            'companyName' => $companyName,
        ];
    }
}
