 
function serverTime() { 
    var time = null; 
    $.ajax({url: '/libs/serverTime.php', 
        async: false, dataType: 'text', 
        success: function(text) { 
            time = new Date(text); 
        }, error: function(http, message, exc) { 
			
            time = new Date(); 
    }}); 
    return time; 
}