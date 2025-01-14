import { http, HttpResponse } from 'msw';
import { exists } from './helpers';
import { APP_URL, LAMBDA_API_URL } from '../config';

export const handlers = [
    http.post(`${APP_URL}/api/signin`, async ({ request }) => {
        const loginInfo = await request.json();

        if(loginInfo.email === 'test@gmail.com' && loginInfo.password === 'PasswordLong-101!') {
            return HttpResponse.json({ userId: 2, success: 'true', token: 'some token' });
        }

        else {
            return new HttpResponse(null, {
                status: 404
            });
        }
    }),

    http.get(`${LAMBDA_API_URL}`, async ({ request }) => {
        const url = new URL(request.url);
        const rank = url.searchParams.get('rank');

        if(!rank || Number(rank) < 0) {
            return new HttpResponse(null, { status: 404 });
        }

        else {
            return HttpResponse.json({ input: 'your rank emoji' });
        }
    }),

    http.get(`${APP_URL}/api/profile/:id`, async(info) => {
        const id = info.params.id;
        const token = info.request.headers.get('Authorization');

        // this is with the assumption only one user with an id of 1 exists
        if(id === '2' && token === 'some token') {
            // simulate some activity for logging in
            return HttpResponse.json({ id: 2, email: 'test@gmail.com', name: 'Jim', entries: 2, profile_picture: 'some url'});
        }

        else {
            return HttpResponse.json('Unauthorized');
        }
    }),

    http.get(`${APP_URL}/api/upload/signedurl`, (info) => {
        return HttpResponse.json({ imageUrl: 'url' });
    }),

    http.post(`${APP_URL}/api/reset_password`, async ({ request }) => {
        const resetPasswordInfo = await request.json();
        const token = 'a valid non-expired token';

        if(token === 'a valid non-expired token') {
            return HttpResponse.json('Password reset!');
        }

        else {
            return new HttpResponse(null, {
                status: 401
            });
        }
    }),

    http.post(`${APP_URL}/api/register`, async ({ request }) => {
        const users = [{id: 1, name: 'Jimbo', email: 'jimbo@test.com'}];
        const registerInfo = await request.json();

        if(registerInfo.email && registerInfo.name && registerInfo.password && !exists(users, registerInfo.email)) {
            return HttpResponse.json({ user: { id: 2, name: 'Jim', email: 'test@gmail.com', entries: 0, profile_picture: '' }, session: { userId: 2, success: 'true', token: 'some token' }});
        }

        else {
            return new HttpResponse(null, {
                status: 404
            });
        }
    }),

    http.post(`${APP_URL}/api/upload/picture`, async ({ request }) => {
        const data = await request.formData();
        return HttpResponse.json({success: 'true'});
    }),

    http.put(`${APP_URL}/api/profile/:id`, async({ request }) => {
        const body = await request.json();
        const { name, age } = body;

        if(name && age) {
            return new HttpResponse(null, { status: 200 });
        }

        else if(name || age) {
            return new HttpResponse(null, { status: 200 });
        }

        else {
            return new HttpResponse(null, { status: 400 });
        }
    }),

    http.delete(`${APP_URL}/api/delete`, async ({ request }) => {
        const userInfo = await request.json();
        const { email, password } = userInfo;

        if(email && password && exists([{ id: 2, email: 'test@gmail.com', password: 'PasswordLong-101!' }], email )) {
            return HttpResponse.json({ id: 2 });
        }

        else {
            return new HttpResponse(null, { status: 401 })
        }
    }),

    http.put(`${APP_URL}/api/image`, async({ request }) => {
        const auth = request.headers.get('Authorization');

        if(auth === 'some token') {
            return HttpResponse.json(3);
        }

        else {
            return new HttpResponse(null, { status: 400 });
        }
    }),

    http.post(`${APP_URL}/api/faceurl`, async({ request }) => {
        const formData = await request.formData();
        const image = formData.get('image');

        // we would want to add other photo types to have a closer representation of the valid file types
        // we will accept, but this is good for our use case
        if(image !== '[object File]' && !image.endsWith('.png')) {
            return new HttpResponse(null, { status: 400 });
        }
        
        if(formData && formData.get('image') !== '') {
            return HttpResponse.json(
                { 
                    cfdInfo: { 
                        outputs: [
                            { 
                                data: { 
                                    regions: [
                                        {
                                            region_info: {
                                                bounding_box: {
                                                    left_col: 1,
                                                    top_row: 1,
                                                    right_col: 1,
                                                    bottom_row: 1
                                                }
                                            },

                                            
                                            data: {
                                                concepts: [
                                                    { name: 'Celeb Name 1' }
                                                ]
                                            }
                                        },

                                        {
                                            region_info: {
                                                bounding_box: {
                                                    left_col: 2,
                                                    top_row: 2,
                                                    right_col: 2,
                                                    bottom_row: 2
                                                }
                                            },

                                            data: {
                                                concepts: [
                                                    { name: 'Celeb Name 2' }
                                                ]
                                            }
                                        },

                                        {
                                            region_info: {
                                                bounding_box: {
                                                    left_col: 3,
                                                    top_row: 3,
                                                    right_col: 3,
                                                    bottom_row: 3
                                                }
                                            },

                                            data: {
                                                concepts: [
                                                    { name: 'Celeb Name 3' }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ] 
                    }
                }
            );
        }

        else {
            return new HttpResponse(null, { status: 400 });
        }
    })
];