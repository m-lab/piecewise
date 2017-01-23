{% set map_center_lat = (map_coordinate_southwest.lat + map_coordinate_northeast.lat)/2 %}
{% set map_center_lon = (map_coordinate_southwest.lon + map_coordinate_northeast.lon)/2 %}
{% set map_center -%}
	{{ map_center_lat|replace("(","") }}, {{ map_center_lon|replace(")","") }}
{%- endset %}
var center = [{{ map_center }}];
