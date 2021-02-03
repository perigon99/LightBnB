select properties.city, count(reservations.*) as total_reservation
from properties 
join reservations on property_id = properties.id
group by properties.city
order by total_reservation desc