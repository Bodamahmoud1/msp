#!/bin/bash

# Disable bracketed paste to fix ^[[200~ artifacts in netcat
echo "set enable-bracketed-paste off" >> /etc/inputrc

# Helper function to create a user with a password
create_user() {
    local username=$1
    local password=$2
    local description=$3
    useradd -m -s /bin/bash "$username"
    echo "$username:$password" | chpasswd
    
    # Configure .bashrc using heredoc to avoid quoting issues
    cat <<EOF >> "/home/$username/.bashrc"
export PS1='\u > '
cd ~
if [ ! -z "$description" ]; then
    echo '---------------------------------------------------'
    echo "$description"
    echo '---------------------------------------------------'
fi

submit_func() {
    cur=\$(whoami)
    # Handle game flow exceptions
    if [ "\$cur" == "chall6" ]; then
        su ghost
        return
    fi
    if [ "\$cur" == "ghost" ]; then
        su chall7
        return
    fi
    
    num=\${cur//[!0-9]/}
    next=\$((num + 1))
    su chall\$next
}
alias submit=submit_func
EOF
}

# --- Challenge 1: Deep Navigation ---
# Goal: Navigate a deep directory structure
create_user "chall1" "chall1" "Welcome to Version 2 of the MSP Linux Race!

New challenges, new tricks.
Use 'submit' to jump to the next user once you find the flag.
Made by @MushroomWasp

Challenge 1: The flag is buried deep inside a directory maze. Start digging."
cd /home/chall1
mkdir -p maze/level1/level2/level3/level4
echo "flag{cd_and_ls_are_basic}" > maze/level1/level2/level3/level4/flag
chown -R root:root .
chmod -R 755 .

# --- Challenge 2: Grep (Needle in Haystack) ---
# Goal: Find the flag inside a large file
create_user "chall2" "flag{cd_and_ls_are_basic}" "Challenge 2: The flag is hidden inside 'haystack.txt'. It's too big to read manually. Use 'grep'."
cd /home/chall2
# Generate junk data
base64 /dev/urandom | head -c 100000 > haystack.txt
echo "flag{grep_finds_needles}" >> haystack.txt
base64 /dev/urandom | head -c 100000 >> haystack.txt
chmod 644 haystack.txt

# --- Challenge 3: Permissions (chmod) ---
# Goal: chmod +r
create_user "chall3" "flag{grep_finds_needles}" "Challenge 3: 'flag.txt' is locked. Change its permissions so you can read it."
cd /home/chall3
echo "flag{permissions_are_key}" > flag.txt
chmod 000 flag.txt
chown chall3:chall3 flag.txt

# --- Challenge 4: Hidden Directory ---
# Goal: Find hidden directory
create_user "chall4" "flag{permissions_are_key}" "Challenge 4: I hid the flag in a secret basement. Look for hidden directories."
cd /home/chall4
mkdir .basement
echo "flag{dots_mean_hidden}" > .basement/treasure
chmod 755 .basement
chmod 644 .basement/treasure

# --- Challenge 5: Absolute Paths ---
# Goal: Read file in /tmp
create_user "chall5" "flag{dots_mean_hidden}" "Challenge 5: I dropped the flag in the temporary folder."
echo "flag{look_outside_your_home}" > /tmp/gift_for_chall5
chmod 644 /tmp/gift_for_chall5

# --- Challenge 6: Switch User (Ghost) ---
# Goal: su ghost
create_user "chall6" "flag{look_outside_your_home}" "Challenge 6: The user 'ghost' has the next flag. His password is 'boo'."
create_user "ghost" "boo" ""
cd /home/ghost
echo "flag{ghost_in_the_shell}" > flag.txt
chmod 644 flag.txt

# --- Challenge 7: File Size ---
# Goal: Find the non-empty file
create_user "chall7" "flag{ghost_in_the_shell}" "Challenge 7: Only one of these files contains the flag. The rest are empty."
cd /home/chall7
# Create 99 empty files
for i in {1..99}; do touch "file_$i"; done
# Create one file with content
FINAL_FLAG="flag{size_matters_sometimes}"
echo "$FINAL_FLAG" > file_42
chmod 644 *

# --- Final Level: chall8 ---
# Goal: Run the leaderboard script
create_user "chall8" "$FINAL_FLAG" "CONGRATULATIONS! You finished! Run './finish.sh' to claim your spot."

# --- Final: Run Me Script ---
# Move the python script to a system bin location
mv /root/submit_score.py /usr/local/bin/submit_score
chmod 700 /usr/local/bin/submit_score
chown root:root /usr/local/bin/submit_score

# Configure sudoers to allow 'chall8' user to run this script as root WITHOUT password
echo "chall8 ALL=(root) NOPASSWD: /usr/local/bin/submit_score" >> /etc/sudoers

# Create the wrapper script for the user
cat <<EOF > /home/chall8/finish.sh
#!/bin/bash
sudo /usr/local/bin/submit_score
EOF

chmod +x /home/chall8/finish.sh
chown chall8:chall8 /home/chall8/finish.sh

# --- Leaderboard Setup ---
# Create a shared directory for scoring
mkdir -p /var/race
touch /var/race/leaderboard.txt

# RESTRICT permissions: Only root can write, everyone can read.
chmod 755 /var/race
chmod 644 /var/race/leaderboard.txt
chown root:root /var/race/leaderboard.txt