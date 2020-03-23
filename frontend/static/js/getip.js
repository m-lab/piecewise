function httpGet(theUrl)  {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send( null );
  return xmlHttp.responseText;
};
getip = httpGet('https://ipinfo.io/json');

var obj = JSON.parse(getip);
var ip = obj.ip;
var city = obj.city;
var region = obj.region;
var country = obj.country;
var ip_location = obj.loc;
var asn = obj.org;
var zipcode = obj.postal;
var timezone = obj.timezone;

document.getElementById('client_ip').value = ip;
document.getElementById('client_city').value = city;
document.getElementById('client_region').value = region;
document.getElementById('client_country').value = country;
document.getElementById('client_ipinfo_loc').value = ip_location;
document.getElementById('client_asn').value = asn;
document.getElementById('client_zipcode').value = zipcode;
document.getElementById('client_timezone').value = timezone;
