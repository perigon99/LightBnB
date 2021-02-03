insert into users (name,email,password)
values 
('sebastien', 'test@testr.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
 ('robert', 'rob@testr.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
 ('julia', 'jul@testr.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.');
 
insert into properties (owner_id,title,description,thumbnail_photo_url,cover_photo_url,cost_per_night,parking_spaces,number_of_bathrooms,number_of_bedrooms,country,street,city,province,post_code,active)
values 
(1,'big house','Like trump tower but with good taste', 'http:', 'http:', 455, 9,7,9, 'Canada','545345 tree', 'bugtown', 'Qc','JM1 PAC', true),
 (2,'crappy house', 'Even rats flee the house','http:', 'http:', 55,0,1,3, 'Canada','3453455 bacon', 'bugtown', 'Qc','JM1 PAC', true),
 (3,'tiny house', 'So tiny you wont find it','http:', 'http:', 65,1,1,1, 'Canada','3234643 nowere', 'bugtown', 'Qc','JM1 PAC', true);
 
insert into reservations (start_date,end_date,property_id,guest_id)
values 
('2021-02-22', '2021-12-22', 1,3),
 ('2021-08-15', '2021-12-22', 2,2),
 ('2112-11-12', '2112-12-22', 3,1);
 
insert into property_reviews (guest_id,property_id,reservation_id,rating,message)
values 
(1,3,1,3, 'little haven'),
 (2,2,3,1, 'Dumpster was cleaner than the house'),
 (3,1,2,4,'Found last people who rented the place, they were lost');