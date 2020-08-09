var csrftoken = $.cookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


$('#generate_scrapy_script').click(function(){
    let api_url = $(this).attr("data-url"); // will return the string "123"
    let original_btn_text = $(this).text();
    $(this).text('Loading...');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    $.ajax({
        type: 'POST',
        url: api_url,
        dataType: 'json',
        success: function (res) {
          console.log(res);
          alert(`Succesfully created spider. You can find it at: ${res.path}`);
          $('#generate_scrapy_script').text(original_btn_text);
        },
        error: function (error) {
            alert("Something went wrong, please check logs");
            // alert(error);
            console.log(error);
        }
    });
});
