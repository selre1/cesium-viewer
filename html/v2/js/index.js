const body = document.querySelector("body"),
    headerBtn = document.querySelector(".image-text"),
    sidebar = body.querySelector(".sidebar"),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    modeSwtich = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text");

headerBtn.addEventListener("click", () => {
    location.href = "/";
})

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
});


modeSwtich.addEventListener("click", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
        modeText.innerText = "Light Mode";
    } else {
        modeText.innerText = "Dark Mode";
    }
});




function getIgdbItem() {
    var item = $('#igdb_id')[0].value;
    $.ajax({
        type: "POST",
        url: "api/games/" + item,
        dataType: "json",
        success: function (res) {
            for (let i = 0; i < res.data.length; i++) {
                window.open(res.data[i][0].url, res.data[i][0].url);
            }
        },
        beforeSend: function () {
            $('#igdb_id')[0].value = "검색 중 기다리시면 열려요";
        },
        complete: function () {
            // 로딩창 구현용
        },
        error: function (e) {
            alert("없는 id 입니다");
        }
    });
}

function getMultiIgdbItem() {
    var igdb_multi_id = $('#igdb_multi_id')[0].value;
    console.log(igdb_multi_id);
    $.ajax({
        type: "POST",
        url: "api/games/multi/" + igdb_multi_id,
        dataType: "json",
        success: function (res) {
            //window.open(`${res.data[0].url}`, "1");
        },
        beforeSend: function () {
            // 로딩창 구현용
        },
        complete: function () {
            // 로딩창 구현용
        },
        error: function (e) {
            alert("없는 id 입니다");
        }
    });
}

function enterKey() {
    if (window.event.keyCode == 13) {
        getIgdbItem();
    }
}

function enterKey2() {
    if (window.event.keyCode == 13) {
        getMultiIgdbItem();
    }
}