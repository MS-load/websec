import { NextRequest, NextResponse } from 'next/server';
import pool from "../../lib/db";
import bcrypt from 'bcryptjs';


export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {

    const client = await pool.connect();
    // const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    // const query = `SELECT username FROM users WHERE username = '${username}' AND password = '${password}'`;
    // const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    
    const query = 'SELECT password FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
  
    if (result.rows.length === 0) {
      return NextResponse.json('No user', { status: 401 });
    }
    console.log('Executing query:', query);
  
    const hashedPassword = result.rows[0].password;
    const valid = await bcrypt.compare(password, hashedPassword);

    if(!valid) {
      return NextResponse.json('Invalid credentials', { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful', user: username });

    // const result = await client.query(query);
    // const result = await client.query(
    //  'SELECT * FROM users WHERE username = $1 AND password = $2',
    //   [username, password]
    // );

    // console.log(result);
    client.release();
    if (result?.rows?.length > 0) {
      // return NextResponse.json('Login successful');
      return NextResponse.json({ message: 'Login successful', user: result.rows[0].username });
    } else {
      console.log(result);
      return NextResponse.json('Invalid credentials', { status: 401 });
    }
  } catch (err: unknown) {
    console.error(err, 'Error logging in');
    if (err instanceof Error) {
      return NextResponse.json(err.message, { status: 500 });
    }
    return NextResponse.json('Server error', { status: 500 });
  }
}
